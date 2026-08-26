import { toRaw } from 'vue'
import type { PathKey, PathList, ResponseFilter } from './types.js'

export interface PathHit {
  exists: boolean
  value: any
  segments: string[]
}

const hasOwn = (value: object, key: string): boolean =>
  Object.prototype.hasOwnProperty.call(value, key)

export const isPlainObject = (value: unknown): value is Record<string, any> => {
  if (value === null || typeof value !== 'object') return false
  const proto = Object.getPrototypeOf(toRaw(value))
  return proto === Object.prototype || proto === null
}

export const isObjectLike = (value: unknown): value is Record<string, any> =>
  value !== null && typeof value === 'object'

export const normalizePath = (path: PathKey): string => String(path)

export const cloneDeep = <T>(value: T): T => {
  const raw = toRaw(value) as any

  if (Array.isArray(raw)) {
    return raw.map((item) => cloneDeep(item)) as T
  }

  if (isPlainObject(raw)) {
    const result: Record<string, any> = {}

    Object.keys(raw).forEach((key) => {
      result[key] = cloneDeep(raw[key])
    })

    return result as T
  }

  return raw
}

export const mergeDeep = <T>(target: T, source: any): T => {
  if (source === undefined) return cloneDeep(target)

  if (Array.isArray(source)) return cloneDeep(source) as T

  if (!isPlainObject(target) || !isPlainObject(source)) {
    return cloneDeep(source) as T
  }

  const result = cloneDeep(target) as Record<string, any>

  Object.keys(source).forEach((key) => {
    if (isPlainObject(result[key]) && isPlainObject(source[key])) {
      result[key] = mergeDeep(result[key], source[key])
      return
    }

    result[key] = cloneDeep(source[key])
  })

  return result as T
}

export const locatePath = (source: any, path: PathKey): PathHit => {
  const normalized = normalizePath(path)

  if (!isObjectLike(source)) {
    return { exists: false, value: undefined, segments: [] }
  }

  const rawSource = toRaw(source)

  if (hasOwn(rawSource, normalized)) {
    return {
      exists: true,
      value: rawSource[normalized],
      segments: [normalized],
    }
  }

  const parts = normalized.split('.')
  let current = rawSource
  const segments: string[] = []

  for (let index = 0; index < parts.length; index += 1) {
    if (!isObjectLike(current)) {
      return { exists: false, value: undefined, segments }
    }

    const remaining = parts.slice(index).join('.')
    const rawCurrent = toRaw(current)

    if (hasOwn(rawCurrent, remaining)) {
      return {
        exists: true,
        value: rawCurrent[remaining],
        segments: [...segments, remaining],
      }
    }

    const part = parts[index]

    if (!hasOwn(rawCurrent, part)) {
      return { exists: false, value: undefined, segments }
    }

    current = rawCurrent[part]
    segments.push(part)
  }

  return {
    exists: true,
    value: current,
    segments,
  }
}

export const getByPath = (source: any, path: PathKey): any => {
  const hit = locatePath(source, path)
  return hit.exists ? hit.value : undefined
}

export const hasByPath = (source: any, path: PathKey): boolean =>
  locatePath(source, path).exists

export const setBySegments = (
  target: Record<string, any>,
  segments: string[],
  value: any,
): void => {
  if (segments.length === 0) return

  let current = target

  segments.forEach((segment, index) => {
    const last = index === segments.length - 1

    if (last) {
      current[segment] = cloneDeep(value)
      return
    }

    if (!isObjectLike(current[segment]) || Array.isArray(current[segment])) {
      current[segment] = {}
    }

    current = current[segment]
  })
}

export const setByPath = (
  target: Record<string, any>,
  path: PathKey,
  value: any,
): void => {
  setBySegments(target, normalizePath(path).split('.'), value)
}

export const deleteByPath = (target: any, path: PathKey): void => {
  const hit = locatePath(target, path)

  if (!hit.exists || hit.segments.length === 0) return

  let current = target

  for (let index = 0; index < hit.segments.length - 1; index += 1) {
    current = current?.[hit.segments[index]]
  }

  if (!isObjectLike(current)) return

  delete current[hit.segments[hit.segments.length - 1]]
}

export const pickPaths = (source: any, paths: PathList): any => {
  const result: Record<string, any> = {}

  paths.forEach((path) => {
    const hit = locatePath(source, path)

    if (hit.exists) {
      setBySegments(result, hit.segments, hit.value)
    }
  })

  return result
}

export const filterData = (source: any, filter?: ResponseFilter): any => {
  if (source instanceof FormData) return source

  let result =
    filter?.only !== undefined ? pickPaths(source, filter.only) : cloneDeep(source)

  filter?.omit?.forEach((path) => {
    deleteByPath(result, path)
  })

  return result
}

export const createSnapshot = (source: any, omit?: PathList): any => {
  if (source instanceof FormData) return null

  return filterData(source, { omit })
}

export const deepEqual = (left: any, right: any): boolean => {
  const leftRaw = toRaw(left)
  const rightRaw = toRaw(right)

  if (Object.is(leftRaw, rightRaw)) return true

  if (Array.isArray(leftRaw) || Array.isArray(rightRaw)) {
    if (!Array.isArray(leftRaw) || !Array.isArray(rightRaw)) return false
    if (leftRaw.length !== rightRaw.length) return false

    return leftRaw.every((item, index) => deepEqual(item, rightRaw[index]))
  }

  if (isPlainObject(leftRaw) || isPlainObject(rightRaw)) {
    if (!isPlainObject(leftRaw) || !isPlainObject(rightRaw)) return false

    const leftKeys = Object.keys(leftRaw)
    const rightKeys = Object.keys(rightRaw)

    if (leftKeys.length !== rightKeys.length) return false

    return leftKeys.every(
      (key) => hasOwn(rightRaw, key) && deepEqual(leftRaw[key], rightRaw[key]),
    )
  }

  return false
}

export const getDirtyData = (current: any, original: any): any => {
  if (deepEqual(current, original)) return {}

  if (Array.isArray(current)) return cloneDeep(current)

  if (!isPlainObject(current) || !isPlainObject(original)) return cloneDeep(current)

  const result: Record<string, any> = {}

  Object.keys(current).forEach((key) => {
    if (!deepEqual(current[key], original[key])) {
      if (isPlainObject(current[key]) && isPlainObject(original[key])) {
        const nested = getDirtyData(current[key], original[key])

        if (isPlainObject(nested) && Object.keys(nested).length === 0) return

        result[key] = nested
        return
      }

      result[key] = cloneDeep(current[key])
    }
  })

  return result
}

export const collectChangedPaths = (
  current: any,
  previous: any,
  prefix = '',
): string[] => {
  if (deepEqual(current, previous)) return []

  if (!isPlainObject(current) || !isPlainObject(previous)) {
    return prefix ? [prefix] : []
  }

  const keys = new Set([...Object.keys(current), ...Object.keys(previous)])
  const paths: string[] = []

  keys.forEach((key) => {
    const childPrefix = prefix ? `${prefix}.${key}` : key
    paths.push(...collectChangedPaths(current[key], previous[key], childPrefix))
  })

  return paths
}
