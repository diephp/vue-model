import { getByPath, isPlainObject } from './path.js';
const toArray = (value) => {
    if (value === undefined || value === null)
        return [];
    if (Array.isArray(value)) {
        return value
            .flatMap((item) => toArray(item))
            .filter((item) => typeof item === 'string');
    }
    if (typeof value === 'string')
        return [value];
    if (typeof value === 'number' || typeof value === 'boolean')
        return [String(value)];
    if (isPlainObject(value)) {
        return Object.values(value).flatMap((item) => toArray(item));
    }
    return [];
};
const flattenKeys = (value, prefix = '') => {
    if (value === undefined || value === null)
        return [];
    if (Array.isArray(value) || typeof value === 'string') {
        return prefix ? [prefix] : [];
    }
    if (!isPlainObject(value))
        return prefix ? [prefix] : [];
    return Object.keys(value).flatMap((key) => {
        const nextPrefix = prefix ? `${prefix}.${key}` : key;
        return flattenKeys(value[key], nextPrefix);
    });
};
export class ApixError extends Error {
    constructor(input) {
        super(input.message ?? 'Request failed');
        this.name = 'ApixError';
        this.httpCode = input.httpCode;
        this.body = input.body;
        this.aborted = Boolean(input.aborted);
        this.timeout = Boolean(input.timeout);
        this.cause = input.cause;
        this.errorBag = input.errors ?? input.body?.errors ?? {};
    }
    error(key) {
        return this.errors(key)[0] ?? null;
    }
    errors(key) {
        if (key === undefined)
            return this.errorBag;
        const value = getByPath(this.errorBag, key);
        return toArray(value);
    }
    keys() {
        return flattenKeys(this.errorBag);
    }
    has(keyOrKeys) {
        const keys = Array.isArray(keyOrKeys) ? keyOrKeys : [keyOrKeys];
        return keys.some((key) => this.error(key) !== null);
    }
    firstKey() {
        return this.keys()[0] ?? null;
    }
}
export const getMessageFromBody = (body, fallback = 'Request failed') => {
    if (typeof body?.message === 'string')
        return body.message;
    if (Array.isArray(body?.messages)) {
        const first = body.messages[0];
        if (typeof first === 'string')
            return first;
        if (typeof first?.message === 'string')
            return first.message;
    }
    if (typeof body === 'string' && body.trim())
        return body;
    return fallback;
};
export const getErrorsFromBody = (body) => body?.errors ?? {};
//# sourceMappingURL=error.js.map