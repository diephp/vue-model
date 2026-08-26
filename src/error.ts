import { getByPath, isPlainObject } from './path.js'
import type { PathInput, PathKey } from './types.js'

export interface ApixErrorInput {
  httpCode: number | null
  body?: any
  message?: string | null
  errors?: any
  aborted?: boolean
  timeout?: boolean
  cause?: unknown
}

const toArray = (value: any): string[] => {
  if (value === undefined || value === null) return []

  if (Array.isArray(value)) {
    return value
      .flatMap((item) => toArray(item))
      .filter((item): item is string => typeof item === 'string')
  }

  if (typeof value === 'string') return [value]
  if (typeof value === 'number' || typeof value === 'boolean') return [String(value)]

  if (isPlainObject(value)) {
    return Object.values(value).flatMap((item) => toArray(item))
  }

  return []
}

const flattenKeys = (value: any, prefix = ''): string[] => {
  if (value === undefined || value === null) return []

  if (Array.isArray(value) || typeof value === 'string') {
    return prefix ? [prefix] : []
  }

  if (!isPlainObject(value)) return prefix ? [prefix] : []

  return Object.keys(value).flatMap((key) => {
    const nextPrefix = prefix ? `${prefix}.${key}` : key
    return flattenKeys(value[key], nextPrefix)
  })
}

export class ApixError extends Error {
  public readonly httpCode: number | null
  public readonly body: any
  public readonly aborted: boolean
  public readonly timeout: boolean
  public readonly cause?: unknown
  private readonly errorBag: any

  public constructor(input: ApixErrorInput) {
    super(input.message ?? 'Request failed')

    this.name = 'ApixError'
    this.httpCode = input.httpCode
    this.body = input.body
    this.aborted = Boolean(input.aborted)
    this.timeout = Boolean(input.timeout)
    this.cause = input.cause
    this.errorBag = input.errors ?? input.body?.errors ?? {}
  }

  public error(key: PathInput): string | null {
    return this.errors(key)[0] ?? null
  }

  public errors(): any
  public errors(key: PathInput): string[]
  public errors(key?: PathInput): any {
    if (key === undefined) return this.errorBag
    if (Array.isArray(key)) {
      return key.flatMap((path) => toArray(getByPath(this.errorBag, path)))
    }

    const value = getByPath(this.errorBag, key)
    return toArray(value)
  }

  public keys(): string[] {
    return flattenKeys(this.errorBag)
  }

  public has(keyOrKeys: PathInput): boolean {
    return this.error(keyOrKeys) !== null
  }

  public firstKey(): string | null {
    return this.keys()[0] ?? null
  }
}

export const getMessageFromBody = (
  body: any,
  fallback = 'Request failed',
): string => {
  if (typeof body?.message === 'string') return body.message

  if (Array.isArray(body?.messages)) {
    const first = body.messages[0]

    if (typeof first === 'string') return first
    if (typeof first?.message === 'string') return first.message
  }

  if (typeof body === 'string' && body.trim()) return body

  return fallback
}

export const getErrorsFromBody = (body: any): any => body?.errors ?? {}
