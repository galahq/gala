/**
 * @providesModule connections
 *
 */

export const orderedConnections = [
  'publication',
  'event',
  'grant',
  'implementation',
  'other',
]

export const identifierTypes = ['url', 'doi', 'wikidata']

// Keep in sync with LinkedResource::IDENTIFIER_FORMATS
const IDENTIFIER_FORMATS = {
  url: /^https?:\/\/\S+$/i,
  doi: /^10\.\d{4,9}\/\S+$/,
  wikidata: /^Q\d+$/,
}

// Mirrors LinkedResource#normalize_identifiers
export function normalizeIdentifier ({ type, value }) {
  let normalized = (value || '').trim()
  if (type === 'doi') {
    normalized = normalized.replace(/^(https?:\/\/(dx\.)?doi\.org\/|doi:)/i, '')
  } else if (type === 'wikidata') {
    normalized = normalized
      .replace(/^https?:\/\/(www\.)?wikidata\.org\/(wiki|entity)\//i, '')
      .toUpperCase()
  }
  return { type, value: normalized }
}

export function isValidIdentifier (identifier) {
  const { type, value } = normalizeIdentifier(identifier)
  const format = IDENTIFIER_FORMATS[type]
  return !!format && format.test(value)
}

export function hrefFor ({ type, value }) {
  switch (type) {
    case 'doi':
      return `https://doi.org/${value}`
    case 'wikidata':
      return `https://www.wikidata.org/wiki/${value}`
    default:
      return value
  }
}

export function connectionLabel (resource, intl) {
  if (resource.connection === 'other') return resource.connectionOther
  return intl.formatMessage({
    id: `catalog.linkedResources.connections.${resource.connection}`,
  })
}

// Resources are grouped under a heading per connection; each distinct “other”
// label gets its own group, after the preset ones.
export function groupKey (resource) {
  return resource.connection === 'other'
    ? `other:${(resource.connectionOther || '').trim()}`
    : resource.connection
}
