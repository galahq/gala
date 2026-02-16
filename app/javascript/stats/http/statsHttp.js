/* @flow */
import { Orchard } from 'shared/orchard'

import {
  normalizeStatsPayload,
  parseApiStatsPayload,
} from './statsResponse'

import type {
  StatsData,
  StatsDateRangeParams,
} from '../state/types'

type AbortSignalLike = {
  aborted: boolean,
  addEventListener?: (event: 'abort', callback: () => mixed) => mixed,
  removeEventListener?: (event: 'abort', callback: () => mixed) => mixed,
}

type FetchStatsArgs = {
  dataUrl: string,
  params?: StatsDateRangeParams,
  signal?: AbortSignalLike,
  bypassCache?: boolean,
}

const CACHE_LIMIT = 20
const payloadCache: Map<string, StatsData> = new Map()

function createTimeoutPromise (timeoutMs: number): Promise<any> {
  return new Promise((resolve, reject) => {
    setTimeout(
      () => reject(new Error(`Request timed out after ${timeoutMs / 1000} seconds`)),
      timeoutMs
    )
  })
}

export function fetchWithTimeout<T> (
  promise: Promise<T>,
  timeoutMs: number = 15000
): Promise<T> {
  return Promise.race([promise, createTimeoutPromise(timeoutMs)])
}

function normalizeEndpoint (endpoint: string): string {
  const trimmed = endpoint.replace(/\/$/, '')
  if (trimmed.endsWith('.json')) return trimmed
  return `${trimmed}.json`
}

function compactParams (params: StatsDateRangeParams): { [string]: string } {
  const result = {}
  if (params.from) {
    result.from = params.from
  }
  if (params.to) {
    result.to = params.to
  }
  return result
}

function createAbortError (): Error {
  const error = new Error('The operation was aborted.')
  error.name = 'AbortError'
  return error
}

function withAbortSignal<T> (
  promise: Promise<T>,
  signal: ?AbortSignalLike = null
): Promise<T> {
  if (signal == null) return promise
  if (signal.aborted) return Promise.reject(createAbortError())
  const activeSignal: AbortSignalLike = signal

  return new Promise((resolve, reject) => {
    const onAbort = () => reject(createAbortError())

    if (activeSignal.addEventListener) {
      activeSignal.addEventListener('abort', onAbort)
    }

    promise
      .then(resolve, reject)
      .finally(() => {
        if (activeSignal.removeEventListener) {
          activeSignal.removeEventListener('abort', onAbort)
        }
      })
  })
}

function buildCacheKey (dataUrl: string, params: StatsDateRangeParams): string {
  const endpoint = normalizeEndpoint(dataUrl)
  const from = params.from || ''
  const to = params.to || ''
  return `${endpoint}|${from}|${to}`
}

function readCached (key: string): ?StatsData {
  const cached = payloadCache.get(key)
  if (!cached) return null

  // Keep recently used keys at the end for simple LRU behavior.
  payloadCache.delete(key)
  payloadCache.set(key, cached)
  return cached
}

function writeCached (key: string, payload: StatsData): void {
  if (payloadCache.has(key)) {
    payloadCache.delete(key)
  }

  payloadCache.set(key, payload)

  if (payloadCache.size <= CACHE_LIMIT) return

  const oldestKey = payloadCache.keys().next().value
  if (oldestKey) {
    payloadCache.delete(oldestKey)
  }
}

export function clearStatsCache (): void {
  payloadCache.clear()
}

export async function fetchStats ({
  dataUrl,
  params = {},
  signal,
  bypassCache = false,
}: FetchStatsArgs): Promise<StatsData> {
  const cacheKey = buildCacheKey(dataUrl, params)

  if (!bypassCache) {
    const cached = readCached(cacheKey)
    if (cached) return cached
  }

  const payload = await withAbortSignal(
    Orchard.harvest(normalizeEndpoint(dataUrl), compactParams(params)),
    signal
  )

  const normalized = normalizeStatsPayload(parseApiStatsPayload(payload))
  writeCached(cacheKey, normalized)

  return normalized
}
