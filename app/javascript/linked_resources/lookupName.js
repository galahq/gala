/**
 * Looks up a resource’s name from its persistent identifier, so the linked
 * resource dialog can fill in the name for the author and warn when an
 * identifier doesn’t resolve. DOIs resolve through doi.org content negotiation
 * (Crossref, DataCite, mEDRA, …) and Wikidata QIDs through the Wikidata API;
 * both allow cross-origin requests.
 *
 * @providesModule lookupName
 */

import { isValidIdentifier, normalizeIdentifier } from './connections'

export const LOOKUP_TYPES = ['doi', 'wikidata']

// The outcomes of a lookup
export const FOUND = 'found'
export const NOT_FOUND = 'notFound'
// The registry couldn’t be reached or answered with something unexpected, so
// we don’t know whether the identifier exists
export const UNCHECKED = 'unchecked'

// Can we look this identifier up? Returns it normalized if so
export function lookupable (identifier) {
  return LOOKUP_TYPES.includes(identifier.type) && isValidIdentifier(identifier)
    ? normalizeIdentifier(identifier)
    : null
}

// The first identifier we can look a name up from, normalized
export function lookupIdentifier (identifiers = []) {
  for (const identifier of identifiers) {
    const normalized = lookupable(identifier)
    if (normalized) return normalized
  }
  return null
}

export function lookupKey ({ type, value }) {
  return `${type}:${value}`
}

// Give up on a registry that doesn’t answer in this long
export const LOOKUP_TIMEOUT = 8000
// Wait this long before retrying a rate-limited or failing request, unless the
// registry asks for less with Retry-After
export const RETRY_DELAY = 1000
const MAX_RETRY_DELAY = 3000

class TimeoutError extends Error {
  name = 'TimeoutError'
}

function abortError () {
  return new DOMException('The lookup was aborted', 'AbortError')
}

function wait (ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(abortError())
    const timer = setTimeout(resolve, ms)
    if (signal) {
      signal.addEventListener('abort', () => {
        clearTimeout(timer)
        reject(abortError())
      }, { once: true })
    }
  })
}

// fetch, but rejects with a TimeoutError after LOOKUP_TIMEOUT. Aborting the
// caller’s signal still rejects with an AbortError
async function fetchWithTimeout (url, { signal, ...options } = {}) {
  if (signal?.aborted) throw abortError()

  const controller = new AbortController()
  let timedOut = false
  const timer = setTimeout(() => {
    timedOut = true
    controller.abort()
  }, LOOKUP_TIMEOUT)
  const forwardAbort = () => controller.abort()
  if (signal) signal.addEventListener('abort', forwardAbort, { once: true })

  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } catch (e) {
    if (timedOut) throw new TimeoutError('The registry didn’t answer in time')
    throw e
  } finally {
    clearTimeout(timer)
    if (signal) signal.removeEventListener('abort', forwardAbort)
  }
}

function retryable (response) {
  return response.status === 429 || response.status >= 500
}

function retryDelay (response) {
  const seconds = Number(response?.headers?.get('Retry-After'))
  return Number.isFinite(seconds) && seconds > 0
    ? Math.min(seconds * 1000, MAX_RETRY_DELAY)
    : RETRY_DELAY
}

// Retries a rate-limited (429) or failing (5xx) request once
async function fetchWithRetry (url, options) {
  const response = await fetchWithTimeout(url, options)
  if (!retryable(response)) return response
  await wait(retryDelay(response), options.signal)
  return fetchWithTimeout(url, options)
}

// Crossref titles can carry JATS/HTML markup like <i>…</i>
function cleanTitle (title) {
  const text = Array.isArray(title) ? title[0] : title
  if (typeof text !== 'string') return null
  const cleaned = text
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  return cleaned || null
}

// Encode each part of the DOI (they can contain “#” or “?”) but keep the “/”
function doiPath (doi) {
  return doi.split('/').map(encodeURIComponent).join('/')
}

// Does the DOI exist? Asks the DOI handle system directly, which answers
// whether or not the registration agency serves metadata for it
async function doiExists (doi, { signal }) {
  const response = await fetchWithRetry(
    `https://doi.org/api/handles/${doiPath(doi)}`,
    { signal }
  )
  if (response.status === 404) return false
  if (!response.ok) return null
  const data = await response.json()
  // 1: the handle exists, 100: it doesn’t
  if (data?.responseCode === 1) return true
  if (data?.responseCode === 100) return false
  return null
}

async function lookupDoi (doi, { signal }) {
  const response = await fetchWithRetry(`https://doi.org/${doiPath(doi)}`, {
    headers: { Accept: 'application/vnd.citationstyles.csl+json' },
    signal,
  })

  // doi.org also answers 404 for a real DOI whose agency doesn’t serve
  // metadata this way, so make sure before saying it doesn’t exist
  if (response.status === 404) {
    const exists = await doiExists(doi, { signal })
    if (exists === false) return { status: NOT_FOUND }
    if (exists === true) return { status: FOUND, name: null }
    return { status: UNCHECKED }
  }
  if (!response.ok) return { status: UNCHECKED }
  const data = await response.json()
  return { status: FOUND, name: cleanTitle(data?.title) }
}

async function lookupWikidata (qid, { locale, signal }) {
  const languages = [...new Set([locale, 'en'].filter(Boolean))].join('|')
  const params = new URLSearchParams({
    action: 'wbgetentities',
    ids: qid,
    props: 'labels',
    languages,
    languagefallback: '1',
    format: 'json',
    origin: '*',
  })
  const url = `https://www.wikidata.org/w/api.php?${params}`
  let response = await fetchWithRetry(url, { signal })
  if (!response.ok) return { status: UNCHECKED }
  let data = await response.json()

  // Wikidata can report rate limiting and server lag in a 200 response
  if (['ratelimited', 'maxlag'].includes(data?.error?.code)) {
    await wait(retryDelay(response), signal)
    response = await fetchWithTimeout(url, { signal })
    if (!response.ok) return { status: UNCHECKED }
    data = await response.json()
  }

  // Wikidata answers 200 for a missing item: { entities: { Q…: { missing: '' } } }
  // or, for an ID it can’t parse, { error: { code: 'no-such-entity' } }
  const entity = data?.entities?.[qid]
  if (data?.error?.code === 'no-such-entity' || (entity && 'missing' in entity)) {
    return { status: NOT_FOUND }
  }
  if (!entity) return { status: UNCHECKED }

  const labels = entity.labels || {}
  const label = labels[locale] || labels.en || Object.values(labels)[0]
  return { status: FOUND, name: cleanTitle(label?.value) }
}

// Resolves to { status: FOUND, name } (name may be null if the record has no
// title), { status: NOT_FOUND }, or { status: UNCHECKED } when the registry
// couldn’t be reached, timed out, or kept failing. Rejects only when aborted
export default async function lookupName (
  { type, value },
  { locale = 'en', signal } = {}
) {
  try {
    switch (type) {
      case 'doi':
        return await lookupDoi(value, { signal })
      case 'wikidata':
        return await lookupWikidata(value, { locale, signal })
      default:
        return { status: UNCHECKED }
    }
  } catch (e) {
    if (e?.name === 'AbortError') throw e
    return { status: UNCHECKED }
  }
}
