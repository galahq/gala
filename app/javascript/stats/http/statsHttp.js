/*  */
import { Orchard } from 'shared/orchard'

import {
  normalizeStatsPayload,
  parseApiStatsPayload,
} from './statsResponse'




const CACHE_LIMIT = 20
const payloadCache = new Map()

function createTimeoutPromise (timeoutMs) {
  return new Promise((resolve, reject) => {
    setTimeout(
      () => reject(new Error(`Request timed out after ${timeoutMs / 1000} seconds`)),
      timeoutMs
    )
  })
}

export function fetchWithTimeout (
  promise,
  timeoutMs = 15000
) {
  return Promise.race([promise, createTimeoutPromise(timeoutMs)])
}

function normalizeEndpoint (endpoint) {
  const trimmed = endpoint.replace(/\/$/, '')
  if (trimmed.endsWith('.json')) return trimmed
  return `${trimmed}.json`
}

function compactParams (params) {
  const result = {}
  if (params.from) {
    result.from = params.from
  }
  if (params.to) {
    result.to = params.to
  }
  return result
}

function createAbortError () {
  const error = new Error('The operation was aborted.')
  error.name = 'AbortError'
  return error
}

function withAbortSignal (
  promise,
  signal = null
) {
  if (signal == null) return promise
  if (signal.aborted) return Promise.reject(createAbortError())
  const activeSignal = signal

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

function buildCacheKey (dataUrl, params) {
  const endpoint = normalizeEndpoint(dataUrl)
  const from = params.from || ''
  const to = params.to || ''
  return `${endpoint}|${from}|${to}`
}

function readCached (key) {
  const cached = payloadCache.get(key)
  if (!cached) return null

  // Keep recently used keys at the end for simple LRU behavior.
  payloadCache.delete(key)
  payloadCache.set(key, cached)
  return cached
}

function writeCached (key, payload) {
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

export function clearStatsCache () {
  payloadCache.clear()
}

export async function fetchStats ({
  dataUrl,
  params = {},
  signal,
  bypassCache = false,
}) {
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
