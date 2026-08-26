import { reactive } from 'vue'
import { createApixModel } from './model.js'
import type {
  ApixInstance,
  ApixModel,
  InternalApixState,
  ModelOptions,
  TransformResponse,
} from './types.js'

export const createApix = (): ApixInstance => {
  const state = reactive<InternalApixState>({
    baseUrl: '',
    headers: {},
    activeRequests: 0,
    transformers: [],
  })

  const apix: ApixInstance = {
    get activeRequests() {
      return state.activeRequests
    },

    get processing() {
      return state.activeRequests > 0
    },

    setBaseUrl(url: string): ApixInstance {
      state.baseUrl = url
      return apix
    },

    setHeaders(headers: HeadersInit): ApixInstance {
      state.headers = headers
      return apix
    },

    setHeader(nameOrHeaders: string | HeadersInit, value?: string): ApixInstance {
      const headers = new Headers(state.headers)

      if (typeof nameOrHeaders === 'string') {
        headers.set(nameOrHeaders, value ?? '')
      } else {
        new Headers(nameOrHeaders).forEach((headerValue, headerName) => {
          headers.set(headerName, headerValue)
        })
      }

      state.headers = headers
      return apix
    },

    transformResponse(transformer: TransformResponse): ApixInstance {
      state.transformers.push(transformer)
      return apix
    },

    create<TData = any>(
      url: string,
      options: ModelOptions<TData> = {},
    ): ApixModel<TData> {
      return createApixModel<TData>(state, url, options, 'json')
    },

    createModel<TData = any>(
      url: string,
      options: ModelOptions<TData> = {},
    ): ApixModel<TData> {
      return apix.create<TData>(url, options)
    },

    createCollection<TItem = any>(
      url: string,
      options: ModelOptions<TItem[]> = {},
    ): ApixModel<TItem[]> {
      return apix.create<TItem[]>(url, {
        default: () => [],
        snapshot: false,
        ...options,
      })
    },

    createForm(
      url: string,
      options: ModelOptions<FormData> = {},
    ): ApixModel<FormData> {
      return createApixModel<FormData>(
        state,
        url,
        {
          default: () => new FormData(),
          immediate: false,
          method: 'POST',
          snapshot: false,
          ...options,
        },
        'formData',
      )
    },
  }

  return apix
}
