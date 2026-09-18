import type { WatchStopHandle } from 'vue'
import type { ApixError } from './error.js'

export type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'HEAD'
  | 'OPTIONS'
  | Lowercase<'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS'>

export type PathKey = string | number
export type PathList = PathKey[]
export type PathInput = PathKey | PathList
export type MaybePromise<T> = T | Promise<T>
export type MaybeFactory<T> = T | (() => T)
export type ParamsValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | Date
  | ParamsValue[]
  | { [key: string]: ParamsValue }
export type Params = Record<string, ParamsValue>
export type HeadersFactory = HeadersInit | (() => HeadersInit)

export interface ResponseFilter {
  only?: PathList
  omit?: PathList
}

export interface ApixOptions {
  timeout?: number
}

export interface WatchOptions {
  debounce?: number
  only?: PathList
  omit?: PathList
}

export interface TransformResponseContext {
  body: any
  ok: boolean
  status: number
  statusText: string
  headers: Headers
  url: string
  method: string
  response: Response
}

export type TransformResponse = (
  ctx: TransformResponseContext,
) => MaybePromise<any>

export interface RequestContext<TData = any> {
  model: ApixModel<TData>
  options: ResolvedModelOptions<TData>
  url: string
  method: string
}

export type BeforeRequest<TData = any> = (
  payload: any,
  ctx: RequestContext<TData>,
) => MaybePromise<any>

export type AfterResponse<TData = any> = (
  body: any,
  ctx: RequestContext<TData> & { ok: boolean; status: number },
) => MaybePromise<any>

export type SuccessCallback<TData = any> = (
  body: any,
  model: ApixModel<TData>,
) => void

export type ErrorCallback<TData = any> = (
  error: ApixError,
  model: ApixModel<TData>,
) => void

export type FinishCallback<TData = any> = (
  model: ApixModel<TData>,
  error: ApixError | null,
) => void

export type ProcessingCallback<TData = any> = (
  active: boolean,
  model: ApixModel<TData>,
) => void

export interface ModelOptions<TData = any> {
  params?: Params | (() => Params | undefined)
  path?: PathKey
  headers?: HeadersFactory
  immediate?: boolean
  method?: HttpMethod
  default?: MaybeFactory<TData>
  omit?: PathList
  only?: PathList
  response?: ResponseFilter
  onSuccess?: SuccessCallback<TData>
  onError?: ErrorCallback<TData>
  onFinish?: FinishCallback<TData>
  onProcessing?: ProcessingCallback<TData>
  before?: BeforeRequest<TData>
  after?: AfterResponse<TData>
  watch?: boolean | WatchOptions
  timeout?: number
  abort?: boolean
  locked?: boolean
  snapshot?: boolean
  clearErrorOnChange?: boolean
  body?: any | (() => any)
}

export type RequestOptions<TData = any> = ModelOptions<TData> & {
  url?: string
}

export type ResolvedModelOptions<TData = any> = Omit<
  ModelOptions<TData>,
  'params' | 'headers' | 'default' | 'body'
> & {
  params?: Params
  headers?: HeadersInit
  default?: MaybeFactory<TData>
  body?: any
}

export interface ApixModel<TData = any> {
  data: TData
  processing: boolean
  httpCode: number | null
  message: string | null

  request(url?: string | RequestOptions<TData>, options?: RequestOptions<TData>): Promise<TData>
  get(url?: string | RequestOptions<TData>, options?: RequestOptions<TData>): Promise<TData>
  post(url?: string | RequestOptions<TData>, options?: RequestOptions<TData>): Promise<TData>
  put(url?: string | RequestOptions<TData>, options?: RequestOptions<TData>): Promise<TData>
  patch(url?: string | RequestOptions<TData>, options?: RequestOptions<TData>): Promise<TData>
  delete(url?: string | RequestOptions<TData>, options?: RequestOptions<TData>): Promise<TData>
  reload(options?: RequestOptions<TData>): Promise<TData>
  refresh(options?: RequestOptions<TData>): Promise<TData>
  send(options?: RequestOptions<TData>): Promise<TData>

  setData(data: TData): void
  push(data: any): void
  reset(options?: ResponseFilter): void
  default(options?: ResponseFilter): void

  isDirty(key?: PathKey): boolean
  getOriginal(): any
  getOriginal(key: PathKey): any
  getDirty(): any
  getDirty(key: PathKey): any

  error(key: PathInput): string | null
  errors(): any
  errors(key: PathInput): string[]
  errorKeys(): string[]
  hasErrors(keyOrKeys: PathInput): boolean
  firstErrorKey(): string | null
  getError(): ApixError | null
  clearError(key: PathKey): void
  clearErrors(): void

  stop(): void
}

export interface ApixInstance {
  readonly activeRequests: number
  readonly processing: boolean

  setBaseUrl(url: string): ApixInstance
  setHeaders(headers: HeadersInit): ApixInstance
  setHeader(headers: HeadersInit): ApixInstance
  setHeader(name: string, value: string): ApixInstance
  transformResponse(transformer: TransformResponse): ApixInstance

  request<TResponse = any>(url: string, options?: RequestOptions<TResponse>): Promise<TResponse>
  get<TResponse = any>(url: string, options?: RequestOptions<TResponse>): Promise<TResponse>
  post<TResponse = any>(url: string, options?: RequestOptions<TResponse>): Promise<TResponse>
  put<TResponse = any>(url: string, options?: RequestOptions<TResponse>): Promise<TResponse>
  patch<TResponse = any>(url: string, options?: RequestOptions<TResponse>): Promise<TResponse>
  delete<TResponse = any>(url: string, options?: RequestOptions<TResponse>): Promise<TResponse>

  form<TData = Record<string, any>>(
    defaults?: MaybeFactory<TData>,
    options?: ModelOptions<TData>,
  ): ApixModel<TData>
  create<TData = any>(url: string, options?: ModelOptions<TData>): ApixModel<TData>
  createModel<TData = any>(url: string, options?: ModelOptions<TData>): ApixModel<TData>
  createCollection<TItem = any>(
    url: string,
    options?: ModelOptions<TItem[]>,
  ): ApixModel<TItem[]>
  createForm(url: string, options?: ModelOptions<FormData>): ApixModel<FormData>
}

export interface InternalApixState {
  baseUrl: string
  headers: HeadersInit
  activeRequests: number
  transformers: TransformResponse[]
  timeout?: number
}

export interface ModelInternals {
  stops: WatchStopHandle[]
  controller: AbortController | null
  timeoutId: ReturnType<typeof setTimeout> | null
  disposed: boolean
  requestId: number
  latestAppliedRequestId: number
  activeLocalRequests: number
  currentPromise: Promise<any> | null
  original: any
  lastError: ApixError | null
  muteWatch: number
  bodyType: 'json' | 'formData'
}
