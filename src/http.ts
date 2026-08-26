import { cloneDeep, isPlainObject, mergeDeep } from './path.js'
import type { HeadersFactory, HttpMethod, Params, ParamsValue } from './types.js'

export const normalizeMethod = (method?: HttpMethod): string =>
  (method ?? 'GET').toString().toUpperCase()

export const isBodylessMethod = (method: string): boolean =>
  method === 'GET' || method === 'HEAD'

export const resolveMaybeFactory = <T>(value: T | (() => T) | undefined): T | undefined => {
  if (typeof value === 'function') {
    return (value as () => T)()
  }

  return value
}

export const resolveHeaders = (
  globalHeaders?: HeadersInit,
  modelHeaders?: HeadersFactory,
  requestHeaders?: HeadersFactory,
): Headers => {
  const headers = new Headers(globalHeaders)
  const appendHeaders = (value?: HeadersInit): void => {
    if (!value) return

    new Headers(value).forEach((headerValue, headerName) => {
      headers.set(headerName, headerValue)
    })
  }

  appendHeaders(resolveMaybeFactory(modelHeaders))
  appendHeaders(resolveMaybeFactory(requestHeaders))

  return headers
}

const appendParam = (
  searchParams: URLSearchParams,
  key: string,
  value: ParamsValue,
): void => {
  if (value === undefined) return

  if (value === null) {
    searchParams.append(key, '')
    return
  }

  if (value instanceof Date) {
    searchParams.append(key, value.toISOString())
    return
  }

  if (Array.isArray(value)) {
    value.forEach((item) => appendParam(searchParams, key, item))
    return
  }

  if (typeof value === 'object') {
    Object.keys(value).forEach((childKey) => {
      appendParam(searchParams, `${key}.${childKey}`, value[childKey])
    })
    return
  }

  searchParams.append(key, String(value))
}

export const appendParamsToUrl = (url: string, params?: Params): string => {
  if (!params || Object.keys(params).length === 0) return url

  const [base, hash = ''] = url.split('#')
  const separator = base.includes('?') ? '&' : '?'
  const searchParams = new URLSearchParams()

  Object.keys(params).forEach((key) => {
    appendParam(searchParams, key, params[key])
  })

  const query = searchParams.toString()

  if (!query) return url

  return `${base}${separator}${query}${hash ? `#${hash}` : ''}`
}

export const resolveUrl = (baseUrl: string, url?: string): string => {
  if (!url) return baseUrl

  if (/^(https?:)?\/\//i.test(url)) return url

  if (!baseUrl) return url

  if (url.startsWith('?') || url.startsWith('#')) return `${baseUrl}${url}`

  if (baseUrl.endsWith('/') && url.startsWith('/')) {
    return `${baseUrl}${url.slice(1)}`
  }

  if (!baseUrl.endsWith('/') && !url.startsWith('/')) {
    return `${baseUrl}/${url}`
  }

  return `${baseUrl}${url}`
}

export const mergePayloadWithParams = (payload: any, params?: Params): any => {
  if (!params || Object.keys(params).length === 0) return payload

  if (payload instanceof FormData) {
    const formData = new FormData()

    payload.forEach((value, key) => {
      formData.append(key, value)
    })

    Object.keys(params).forEach((key) => {
      const value = params[key]

      if (value === undefined) return

      if (value instanceof Blob) {
        formData.append(key, value)
        return
      }

      if (typeof value === 'object' && value !== null) {
        formData.append(key, JSON.stringify(value))
        return
      }

      formData.append(key, value === null ? '' : String(value))
    })

    return formData
  }

  if (isPlainObject(payload)) {
    return mergeDeep(params, payload)
  }

  if (payload === undefined || payload === null) {
    return cloneDeep(params)
  }

  return payload
}

export const hasHeader = (headers: Headers, name: string): boolean => {
  let found = false

  headers.forEach((_, headerName) => {
    if (headerName.toLowerCase() === name.toLowerCase()) found = true
  })

  return found
}

export const createBody = (
  method: string,
  payload: any,
  headers: Headers,
): BodyInit | undefined => {
  if (isBodylessMethod(method)) return undefined
  if (payload === undefined || payload === null) return undefined

  if (payload instanceof FormData) return payload
  if (typeof payload === 'string') return payload
  if (payload instanceof Blob) return payload
  if (payload instanceof ArrayBuffer) return payload

  if (!hasHeader(headers, 'content-type')) {
    headers.set('content-type', 'application/json')
  }

  return JSON.stringify(payload)
}

export const readResponseBody = async (response: Response): Promise<any> => {
  if (response.status === 204 || response.status === 205) return undefined

  const text = await response.text()

  if (!text) return undefined

  const contentType = response.headers.get('content-type') ?? ''

  if (contentType.includes('json')) {
    return JSON.parse(text)
  }

  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}
