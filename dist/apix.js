import { reactive } from 'vue';
import { createApixModel } from './model.js';
export const createApix = () => {
    const state = reactive({
        baseUrl: '',
        headers: {},
        activeRequests: 0,
        transformers: [],
    });
    const apix = {
        get activeRequests() {
            return state.activeRequests;
        },
        get processing() {
            return state.activeRequests > 0;
        },
        setBaseUrl(url) {
            state.baseUrl = url;
            return apix;
        },
        setHeaders(headers) {
            state.headers = headers;
            return apix;
        },
        setHeader(nameOrHeaders, value) {
            const headers = new Headers(state.headers);
            if (typeof nameOrHeaders === 'string') {
                headers.set(nameOrHeaders, value ?? '');
            }
            else {
                new Headers(nameOrHeaders).forEach((headerValue, headerName) => {
                    headers.set(headerName, headerValue);
                });
            }
            state.headers = headers;
            return apix;
        },
        transformResponse(transformer) {
            state.transformers.push(transformer);
            return apix;
        },
        create(url, options = {}) {
            return createApixModel(state, url, options, 'json');
        },
        createModel(url, options = {}) {
            return apix.create(url, options);
        },
        createCollection(url, options = {}) {
            return apix.create(url, {
                default: () => [],
                snapshot: false,
                ...options,
            });
        },
        createForm(url, options = {}) {
            return createApixModel(state, url, {
                default: () => new FormData(),
                immediate: false,
                method: 'POST',
                snapshot: false,
                ...options,
            }, 'formData');
        },
    };
    return apix;
};
//# sourceMappingURL=apix.js.map