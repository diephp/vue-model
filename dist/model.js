import { getCurrentScope, markRaw, onScopeDispose, reactive, watch } from 'vue';
import { ApixError, getErrorsFromBody, getMessageFromBody } from './error.js';
import { appendParamsToUrl, createBody, isBodylessMethod, mergePayloadWithParams, normalizeMethod, readResponseBody, resolveHeaders, resolveMaybeFactory, resolveUrl, } from './http.js';
import { cloneDeep, collectChangedPaths, createSnapshot, deepEqual, deleteByPath, filterData, getByPath, getDirtyData, isPlainObject, locatePath, mergeDeep, setBySegments, } from './path.js';
const isFormData = (value) => typeof FormData !== 'undefined' && value instanceof FormData;
const normalizeData = (value) => {
    if (isFormData(value))
        return markRaw(value);
    return cloneDeep(value);
};
const getDefaultData = (options) => {
    const value = resolveMaybeFactory(options.default);
    return normalizeData((value === undefined ? null : value));
};
const normalizeRequestArgs = (urlOrOptions, options) => {
    if (typeof urlOrOptions === 'string') {
        return { url: urlOrOptions, options };
    }
    return { options: urlOrOptions };
};
const resolveWatchOptions = (watchOptions, baseOptions) => {
    if (!watchOptions)
        return null;
    const normalized = watchOptions === true ? {} : watchOptions;
    return {
        debounce: normalized.debounce ?? 100,
        only: normalized.only === undefined ? baseOptions.only : normalized.only,
        omit: normalized.omit === undefined ? baseOptions.omit : normalized.omit,
    };
};
const hasAnyPath = (paths, targets) => {
    if (targets === undefined)
        return paths.length > 0;
    if (targets.length === 0)
        return false;
    return paths.some((path) => targets.some((target) => {
        const normalized = String(target);
        return path === normalized || path.startsWith(`${normalized}.`);
    }));
};
const extractResponseData = async (body, model, options, url, method, ok, status) => {
    let data = options.path === undefined ? body : getByPath(body, options.path);
    const after = options.after;
    if (after) {
        data = await after(data, { model, options, url, method, ok, status });
    }
    return filterData(data, options.response);
};
export const createApixModel = (apixState, initialUrl, initialOptions = {}, bodyType = 'json') => {
    const baseOptions = {
        immediate: bodyType === 'formData' ? false : true,
        abort: true,
        locked: false,
        snapshot: bodyType === 'formData' ? false : true,
        clearErrorOnChange: true,
        ...initialOptions,
    };
    const initialData = getDefaultData(baseOptions);
    const state = reactive({
        data: initialData,
        processing: false,
        httpCode: null,
        message: null,
    });
    const internals = {
        stops: [],
        controller: null,
        timeoutId: null,
        disposed: false,
        requestId: 0,
        latestAppliedRequestId: 0,
        activeLocalRequests: 0,
        currentPromise: null,
        original: baseOptions.snapshot === false
            ? null
            : createSnapshot(state.data, baseOptions.omit),
        lastError: null,
        muteWatch: 0,
        bodyType,
    };
    let previousAllData = cloneDeep(state.data);
    let previousWatchedData = null;
    let watchTimer = null;
    const withMutedWatch = (callback) => {
        internals.muteWatch += 1;
        try {
            callback();
            previousAllData = cloneDeep(state.data);
            const watchOptions = resolveWatchOptions(baseOptions.watch, baseOptions);
            previousWatchedData = watchOptions
                ? filterData(state.data, {
                    only: watchOptions.only,
                    omit: watchOptions.omit,
                })
                : null;
        }
        finally {
            queueMicrotask(() => {
                internals.muteWatch = Math.max(0, internals.muteWatch - 1);
            });
        }
    };
    const setProcessing = (active) => {
        if (state.processing === active)
            return;
        state.processing = active;
        baseOptions.onProcessing?.(active, state);
    };
    const startProcessing = () => {
        internals.activeLocalRequests += 1;
        apixState.activeRequests += 1;
        setProcessing(true);
    };
    const finishProcessing = () => {
        internals.activeLocalRequests = Math.max(0, internals.activeLocalRequests - 1);
        apixState.activeRequests = Math.max(0, apixState.activeRequests - 1);
        setProcessing(internals.activeLocalRequests > 0);
    };
    const updateSnapshot = () => {
        if (baseOptions.snapshot === false || isFormData(state.data))
            return;
        internals.original = createSnapshot(state.data, baseOptions.omit);
    };
    const clearErrors = () => {
        state.message = null;
        internals.lastError = null;
    };
    const getLastError = () => internals.lastError;
    const setLastError = (error) => {
        internals.lastError = error;
        state.message = error?.message ?? null;
    };
    const currentErrors = () => getLastError()?.errors() ?? {};
    const replaceBodyErrors = (body, errors) => {
        if (isPlainObject(body))
            return { ...body, errors };
        return { errors };
    };
    const clearErrorByKey = (key) => {
        const lastError = getLastError();
        if (!lastError)
            return;
        const errors = cloneDeep(lastError.errors());
        deleteByPath(errors, key);
        const remainingKeys = new ApixError({
            httpCode: lastError.httpCode,
            body: replaceBodyErrors(lastError.body, errors),
            message: lastError.message,
            errors,
            aborted: lastError.aborted,
            timeout: lastError.timeout,
        }).keys();
        if (remainingKeys.length === 0) {
            clearErrors();
            return;
        }
        setLastError(new ApixError({
            httpCode: lastError.httpCode,
            body: replaceBodyErrors(lastError.body, errors),
            message: lastError.message,
            errors,
            aborted: lastError.aborted,
            timeout: lastError.timeout,
        }));
    };
    const clearRelatedErrors = (changedPath) => {
        const lastError = getLastError();
        if (!lastError)
            return;
        lastError.keys().forEach((key) => {
            if (key === changedPath ||
                key.startsWith(`${changedPath}.`) ||
                changedPath.startsWith(`${key}.`)) {
                clearErrorByKey(key);
            }
        });
    };
    const setData = (data) => {
        state.data = normalizeData(data);
    };
    const push = (data) => {
        if (Array.isArray(state.data)) {
            state.data.push(data);
            return;
        }
        if (isPlainObject(state.data) && isPlainObject(data)) {
            state.data = mergeDeep(state.data, data);
            return;
        }
        state.data = normalizeData(data);
    };
    const applyResponseToData = (responseData, mode, options) => {
        if (internals.bodyType === 'formData')
            return;
        if (responseData === undefined)
            return;
        withMutedWatch(() => {
            const base = mode === 'reload' ? getDefaultData(options) : normalizeData(state.data);
            state.data = mergeDeep(base, responseData);
        });
    };
    const applyResetSource = (source, options, replaceAll = false, preserveModelOmit = false) => {
        withMutedWatch(() => {
            if (!options?.only && !options?.omit && replaceAll) {
                const next = normalizeData(source);
                if (preserveModelOmit && isPlainObject(next)) {
                    baseOptions.omit?.forEach((path) => {
                        const hit = locatePath(state.data, path);
                        if (hit.exists) {
                            setBySegments(next, hit.segments, hit.value);
                        }
                    });
                }
                state.data = next;
                return;
            }
            const filtered = filterData(source, options);
            state.data = mergeDeep(state.data, filtered);
        });
    };
    const reset = (options) => {
        if (baseOptions.snapshot === false || internals.original === null)
            return;
        applyResetSource(internals.original, options, true, true);
    };
    const resetDefault = (options) => {
        applyResetSource(getDefaultData(baseOptions), options, true);
    };
    const isDirty = (key) => {
        if (baseOptions.snapshot === false || internals.original === null)
            return false;
        const current = createSnapshot(state.data, baseOptions.omit);
        if (key !== undefined) {
            if (baseOptions.omit?.some((path) => String(path) === String(key)))
                return false;
            return !deepEqual(getByPath(current, key), getByPath(internals.original, key));
        }
        return !deepEqual(current, internals.original);
    };
    const getOriginal = (key) => {
        if (baseOptions.snapshot === false || internals.original === null) {
            return key === undefined ? null : undefined;
        }
        if (key === undefined)
            return cloneDeep(internals.original);
        return cloneDeep(getByPath(internals.original, key));
    };
    const getDirty = (key) => {
        if (baseOptions.snapshot === false || internals.original === null) {
            return key === undefined ? {} : undefined;
        }
        const current = createSnapshot(state.data, baseOptions.omit);
        if (key !== undefined) {
            if (!isDirty(key))
                return undefined;
            return cloneDeep(getByPath(current, key));
        }
        return getDirtyData(current, internals.original);
    };
    const resolveOptions = (requestOptions, method) => {
        const raw = {
            ...baseOptions,
            ...requestOptions,
            method: (method ?? requestOptions?.method ?? baseOptions.method),
        };
        return {
            ...raw,
            params: resolveMaybeFactory(raw.params),
            headers: resolveMaybeFactory(raw.headers),
            body: resolveMaybeFactory(raw.body),
        };
    };
    const buildPayload = async (options, mode, url, method) => {
        if (options.body !== undefined)
            return options.body;
        if (mode === 'reload')
            return undefined;
        let payload = internals.bodyType === 'formData'
            ? state.data
            : filterData(state.data, {
                only: options.only,
                omit: options.omit,
            });
        if (options.before) {
            payload = await options.before(payload, { model: state, options, url, method });
        }
        return payload;
    };
    const makeRequestError = (input) => new ApixError({
        httpCode: input.httpCode ?? null,
        body: input.body,
        message: input.message ?? getMessageFromBody(input.body, input.fallback),
        errors: input.errors ?? getErrorsFromBody(input.body),
        aborted: input.aborted,
        timeout: input.timeout,
        cause: input.cause,
    });
    const run = (runOptions) => {
        if (internals.disposed) {
            return Promise.reject(makeRequestError({
                httpCode: null,
                message: 'Model has been stopped',
                aborted: true,
            }));
        }
        const requestId = internals.requestId + 1;
        const rawOptions = runOptions.options;
        const method = normalizeMethod((rawOptions?.method ?? runOptions.method ?? baseOptions.method ?? 'GET'));
        const options = resolveOptions(rawOptions, method);
        if (options.locked && state.processing && internals.currentPromise) {
            return internals.currentPromise;
        }
        internals.requestId = requestId;
        if (options.abort && internals.controller) {
            internals.controller.abort();
        }
        const controller = new AbortController();
        internals.controller = controller;
        let timedOut = false;
        let userCallbackError = null;
        let promise;
        promise = (async () => {
            startProcessing();
            try {
                const fullUrl = resolveUrl(apixState.baseUrl, runOptions.url ?? rawOptions?.url ?? initialUrl);
                const payload = await buildPayload(options, runOptions.mode, fullUrl, method);
                const headers = resolveHeaders(apixState.headers, baseOptions.headers, rawOptions?.headers);
                const payloadWithParams = isBodylessMethod(method)
                    ? payload
                    : mergePayloadWithParams(payload, options.params);
                const queryParams = isBodylessMethod(method)
                    ? mergePayloadWithParams(payload, options.params)
                    : undefined;
                const requestUrl = appendParamsToUrl(fullUrl, queryParams);
                const body = createBody(method, payloadWithParams, headers);
                if (options.timeout && options.timeout > 0) {
                    internals.timeoutId = setTimeout(() => {
                        timedOut = true;
                        controller.abort();
                    }, options.timeout);
                }
                const response = await fetch(requestUrl, {
                    method,
                    headers,
                    body,
                    signal: controller.signal,
                });
                let responseBody = await readResponseBody(response);
                for (const transformer of apixState.transformers) {
                    responseBody = await transformer({
                        body: responseBody,
                        ok: response.ok,
                        status: response.status,
                        statusText: response.statusText,
                        headers: response.headers,
                        url: requestUrl,
                        method,
                        response,
                    });
                }
                const latest = requestId === internals.requestId;
                if (!response.ok) {
                    const error = makeRequestError({
                        httpCode: response.status,
                        body: responseBody,
                        fallback: response.statusText,
                    });
                    userCallbackError = error;
                    if (latest) {
                        state.httpCode = response.status;
                        setLastError(error);
                    }
                    options.onError?.(error, state);
                    throw error;
                }
                const responseData = await extractResponseData(responseBody, state, options, requestUrl, method, response.ok, response.status);
                if (latest) {
                    state.httpCode = response.status;
                    clearErrors();
                    applyResponseToData(responseData, runOptions.mode, options);
                    updateSnapshot();
                    internals.latestAppliedRequestId = requestId;
                }
                options.onSuccess?.(responseData, state);
                return state.data;
            }
            catch (cause) {
                const aborted = typeof DOMException !== 'undefined' && cause instanceof DOMException
                    ? cause.name === 'AbortError'
                    : cause?.name === 'AbortError';
                const error = cause instanceof ApixError
                    ? cause
                    : makeRequestError({
                        httpCode: null,
                        body: undefined,
                        message: timedOut
                            ? 'Request timed out'
                            : aborted
                                ? 'Request aborted'
                                : undefined,
                        fallback: 'Request failed',
                        aborted,
                        timeout: timedOut,
                        cause,
                    });
                userCallbackError = error;
                if (!aborted || timedOut) {
                    const latest = requestId === internals.requestId;
                    if (latest) {
                        state.httpCode = error.httpCode;
                        setLastError(error);
                    }
                    if (!(cause instanceof ApixError)) {
                        options.onError?.(error, state);
                    }
                }
                throw error;
            }
            finally {
                if (internals.timeoutId) {
                    clearTimeout(internals.timeoutId);
                    internals.timeoutId = null;
                }
                if (internals.controller === controller) {
                    internals.controller = null;
                }
                finishProcessing();
                options.onFinish?.(state, userCallbackError);
                if (internals.currentPromise === promise) {
                    internals.currentPromise = null;
                }
            }
        })();
        internals.currentPromise = promise;
        return promise;
    };
    const request = (urlOrOptions, options) => {
        const args = normalizeRequestArgs(urlOrOptions, options);
        return run({ url: args.url, options: args.options, mode: 'send' });
    };
    const methodRequest = (method, urlOrOptions, options) => {
        const args = normalizeRequestArgs(urlOrOptions, options);
        return run({
            url: args.url,
            options: args.options,
            method,
            mode: 'send',
        });
    };
    const reload = (options) => run({ options, mode: 'reload' });
    const refresh = (options) => run({ options, mode: 'send' });
    const stop = () => {
        internals.disposed = true;
        internals.stops.forEach((stopWatch) => stopWatch());
        internals.stops = [];
        if (watchTimer) {
            clearTimeout(watchTimer);
            watchTimer = null;
        }
        internals.controller?.abort();
    };
    const setupDataWatcher = () => {
        const watchOptions = resolveWatchOptions(baseOptions.watch, baseOptions);
        const shouldAutoSend = Boolean(watchOptions);
        const shouldClearErrors = baseOptions.clearErrorOnChange !== false;
        if (!shouldAutoSend && !shouldClearErrors)
            return;
        previousWatchedData = watchOptions
            ? filterData(state.data, {
                only: watchOptions.only,
                omit: watchOptions.omit,
            })
            : null;
        const stopWatch = watch(() => state.data, () => {
            const currentAllData = cloneDeep(state.data);
            if (internals.muteWatch > 0) {
                previousAllData = currentAllData;
                previousWatchedData = watchOptions
                    ? filterData(state.data, {
                        only: watchOptions.only,
                        omit: watchOptions.omit,
                    })
                    : null;
                return;
            }
            const changedPaths = collectChangedPaths(currentAllData, previousAllData);
            if (shouldClearErrors) {
                changedPaths.forEach((path) => clearRelatedErrors(path));
            }
            if (shouldAutoSend && watchOptions) {
                const currentWatchedData = filterData(state.data, {
                    only: watchOptions.only,
                    omit: watchOptions.omit,
                });
                if (hasAnyPath(changedPaths, watchOptions.only) &&
                    !deepEqual(currentWatchedData, previousWatchedData)) {
                    if (watchTimer)
                        clearTimeout(watchTimer);
                    watchTimer = setTimeout(() => {
                        watchTimer = null;
                        state.send().catch(() => undefined);
                    }, watchOptions.debounce ?? 100);
                }
                previousWatchedData = currentWatchedData;
            }
            previousAllData = currentAllData;
        }, { deep: true });
        internals.stops.push(stopWatch);
    };
    Object.assign(state, {
        request,
        get: (urlOrOptions, options) => methodRequest('GET', urlOrOptions, options),
        post: (urlOrOptions, options) => methodRequest('POST', urlOrOptions, options),
        put: (urlOrOptions, options) => methodRequest('PUT', urlOrOptions, options),
        patch: (urlOrOptions, options) => methodRequest('PATCH', urlOrOptions, options),
        delete: (urlOrOptions, options) => methodRequest('DELETE', urlOrOptions, options),
        reload,
        refresh,
        send: refresh,
        setData,
        push,
        reset,
        default: resetDefault,
        isDirty,
        getOriginal,
        getDirty,
        error: (key) => getLastError()?.error(key) ?? null,
        errors: (key) => key === undefined ? currentErrors() : getLastError()?.errors(key) ?? [],
        errorKeys: () => getLastError()?.keys() ?? [],
        hasErrors: (keyOrKeys) => getLastError()?.has(keyOrKeys) ?? false,
        firstErrorKey: () => getLastError()?.firstKey() ?? null,
        getError: () => getLastError(),
        clearError: clearErrorByKey,
        clearErrors,
        stop,
    });
    setupDataWatcher();
    if (getCurrentScope()) {
        onScopeDispose(stop);
    }
    if (baseOptions.immediate !== false) {
        queueMicrotask(() => {
            if (internals.disposed)
                return;
            state.reload().catch(() => undefined);
        });
    }
    return state;
};
//# sourceMappingURL=model.js.map