import { cloneDeep, isPlainObject, mergeDeep } from './path.js';
export const normalizeMethod = (method) => (method ?? 'GET').toString().toUpperCase();
export const isBodylessMethod = (method) => method === 'GET' || method === 'HEAD';
export const resolveMaybeFactory = (value) => {
    if (typeof value === 'function') {
        return value();
    }
    return value;
};
export const resolveHeaders = (globalHeaders, modelHeaders, requestHeaders) => {
    const headers = new Headers(globalHeaders);
    const appendHeaders = (value) => {
        if (!value)
            return;
        new Headers(value).forEach((headerValue, headerName) => {
            headers.set(headerName, headerValue);
        });
    };
    appendHeaders(resolveMaybeFactory(modelHeaders));
    appendHeaders(resolveMaybeFactory(requestHeaders));
    return headers;
};
const appendParam = (searchParams, key, value) => {
    if (value === undefined)
        return;
    if (value === null) {
        searchParams.append(key, '');
        return;
    }
    if (value instanceof Date) {
        searchParams.append(key, value.toISOString());
        return;
    }
    if (Array.isArray(value)) {
        value.forEach((item) => appendParam(searchParams, key, item));
        return;
    }
    if (typeof value === 'object') {
        Object.keys(value).forEach((childKey) => {
            appendParam(searchParams, `${key}.${childKey}`, value[childKey]);
        });
        return;
    }
    searchParams.append(key, String(value));
};
export const appendParamsToUrl = (url, params) => {
    if (!params || Object.keys(params).length === 0)
        return url;
    const [base, hash = ''] = url.split('#');
    const separator = base.includes('?') ? '&' : '?';
    const searchParams = new URLSearchParams();
    Object.keys(params).forEach((key) => {
        appendParam(searchParams, key, params[key]);
    });
    const query = searchParams.toString();
    if (!query)
        return url;
    return `${base}${separator}${query}${hash ? `#${hash}` : ''}`;
};
export const resolveUrl = (baseUrl, url) => {
    if (!url)
        return baseUrl;
    if (/^(https?:)?\/\//i.test(url))
        return url;
    if (!baseUrl)
        return url;
    if (url.startsWith('?') || url.startsWith('#'))
        return `${baseUrl}${url}`;
    if (baseUrl.endsWith('/') && url.startsWith('/')) {
        return `${baseUrl}${url.slice(1)}`;
    }
    if (!baseUrl.endsWith('/') && !url.startsWith('/')) {
        return `${baseUrl}/${url}`;
    }
    return `${baseUrl}${url}`;
};
export const mergePayloadWithParams = (payload, params) => {
    if (!params || Object.keys(params).length === 0)
        return payload;
    if (payload instanceof FormData) {
        const formData = new FormData();
        payload.forEach((value, key) => {
            formData.append(key, value);
        });
        Object.keys(params).forEach((key) => {
            const value = params[key];
            if (value === undefined)
                return;
            if (value instanceof Blob) {
                formData.append(key, value);
                return;
            }
            if (typeof value === 'object' && value !== null) {
                formData.append(key, JSON.stringify(value));
                return;
            }
            formData.append(key, value === null ? '' : String(value));
        });
        return formData;
    }
    if (isPlainObject(payload)) {
        return mergeDeep(params, payload);
    }
    if (payload === undefined || payload === null) {
        return cloneDeep(params);
    }
    return payload;
};
export const hasHeader = (headers, name) => {
    let found = false;
    headers.forEach((_, headerName) => {
        if (headerName.toLowerCase() === name.toLowerCase())
            found = true;
    });
    return found;
};
export const createBody = (method, payload, headers) => {
    if (isBodylessMethod(method))
        return undefined;
    if (payload === undefined || payload === null)
        return undefined;
    if (payload instanceof FormData)
        return payload;
    if (typeof payload === 'string')
        return payload;
    if (payload instanceof Blob)
        return payload;
    if (payload instanceof ArrayBuffer)
        return payload;
    if (!hasHeader(headers, 'content-type')) {
        headers.set('content-type', 'application/json');
    }
    return JSON.stringify(payload);
};
export const readResponseBody = async (response) => {
    if (response.status === 204 || response.status === 205)
        return undefined;
    const text = await response.text();
    if (!text)
        return undefined;
    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('json')) {
        return JSON.parse(text);
    }
    try {
        return JSON.parse(text);
    }
    catch {
        return text;
    }
};
//# sourceMappingURL=http.js.map