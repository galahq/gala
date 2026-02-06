/* @flow */
import { useState, useEffect, useMemo, useCallback } from 'react'
import { normalizeIsoCode, toIso2 } from '../map/isoCodes'

const FLAGCDN_BASE_URL = 'https://flagcdn.com'
const FLAG_CODES_CACHE_PREFIX = 'flagcdn-codes-'

type FlagState = {
  namesByIso2: { [string]: string },
  isLoading: boolean,
  error: ?string,
  language: string,
}

function normalizeLanguage (locale: ?string): string {
  if (!locale || typeof locale !== 'string') return 'en'
  const cleaned = locale.trim()
  if (!cleaned) return 'en'
  return cleaned.split(/[-_]/)[0].toLowerCase() || 'en'
}

function getCacheKey (language: string): string {
  return `${FLAG_CODES_CACHE_PREFIX}${language}`
}

function readCache (language: string): ?Object {
  if (typeof localStorage === 'undefined') return null
  const cacheKey = getCacheKey(language)
  const cached = localStorage.getItem(cacheKey)
  if (!cached) return null
  try {
    return JSON.parse(cached)
  } catch (error) {
    localStorage.removeItem(cacheKey)
    return null
  }
}

function writeCache (language: string, data: Object): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(getCacheKey(language), JSON.stringify(data))
  } catch (error) {
  }
}

function isValidCodesPayload (payload: mixed): boolean {
  return payload != null && typeof payload === 'object'
}

function getErrorMessage (error: mixed): string {
  if (error && typeof error === 'object' && typeof error.message === 'string') {
    return error.message
  }
  return 'Failed to load flag manifest'
}

async function fetchCodes (language: string): Promise<Object> {
  const response = await fetch(`${FLAGCDN_BASE_URL}/${language}/codes.json`)
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }
  const payload = await response.json()
  if (!isValidCodesPayload(payload)) {
    throw new Error('Invalid flag manifest response')
  }
  return payload
}

export function useCountryFlags (locale: ?string) {
  const language = useMemo(() => normalizeLanguage(locale), [locale])
  const [state, setState] = useState<FlagState>({
    namesByIso2: {},
    isLoading: true,
    error: null,
    language,
  })

  useEffect(() => {
    let isMounted = true
    const cached = readCache(language)
    if (cached && isMounted) {
      setState({
        namesByIso2: cached,
        isLoading: false,
        error: null,
        language,
      })
    } else if (isMounted) {
      setState(prevState => ({
        ...prevState,
        isLoading: true,
        error: null,
        language,
      }))
    }

    const loadCodes = async () => {
      try {
        const payload = await fetchCodes(language)
        if (!isMounted) return
        writeCache(language, payload)
        setState({
          namesByIso2: payload,
          isLoading: false,
          error: null,
          language,
        })
      } catch (error) {
        if (!isMounted) return
        if (language !== 'en') {
          try {
            const fallbackPayload = await fetchCodes('en')
            if (!isMounted) return
            writeCache('en', fallbackPayload)
            setState({
              namesByIso2: fallbackPayload,
              isLoading: false,
              error: null,
              language: 'en',
            })
          } catch (fallbackError) {
            if (!isMounted) return
            setState({
              namesByIso2: {},
              isLoading: false,
              error: getErrorMessage(fallbackError),
              language: 'en',
            })
          }
        } else {
          setState({
            namesByIso2: {},
            isLoading: false,
            error: getErrorMessage(error),
            language,
          })
        }
      }
    }

    if (!cached) {
      loadCodes()
    }

    return () => {
      isMounted = false
    }
  }, [language])

  const getIso2Code = useCallback((iso2: ?string, iso3: ?string): ?string => {
    const normalizedIso2 = normalizeIsoCode(iso2)
    if (normalizedIso2) return normalizedIso2.toLowerCase()
    const normalizedIso3 = normalizeIsoCode(iso3)
    const derivedIso2 = normalizedIso3 ? toIso2(normalizedIso3) : null
    return derivedIso2 ? derivedIso2.toLowerCase() : null
  }, [])

  const getFlagUrl = useCallback((iso2: ?string, iso3: ?string, format: string = 'svg'): ?string => {
    const code = getIso2Code(iso2, iso3)
    if (!code) return null
    return `${FLAGCDN_BASE_URL}/${code}.${format}`
  }, [getIso2Code])

  const getLocalizedName = useCallback((iso2: ?string, iso3: ?string, fallbackName: ?string): ?string => {
    const code = getIso2Code(iso2, iso3)
    if (code && state.namesByIso2[code]) {
      return state.namesByIso2[code]
    }
    return fallbackName || null
  }, [getIso2Code, state.namesByIso2])

  return {
    ...state,
    getFlagUrl,
    getLocalizedName,
  }
}

export default useCountryFlags
