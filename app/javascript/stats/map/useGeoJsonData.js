/* @flow */
import { useState, useEffect, useCallback } from 'react'
import { GEOJSON_CACHE_KEY } from './mapConfig'

type GeoJsonState = {
  data: any,
  error: ?string,
  isLoading: boolean,
  retry: () => void,
}

export function useGeoJsonData (url: string): GeoJsonState {
  const [data, setData] = useState(null)
  const [error, setError] = useState<?string>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = useCallback((skipCache: boolean = false) => {
    setIsLoading(true)
    setError(null)

    if (!skipCache) {
      const cachedData = localStorage.getItem(GEOJSON_CACHE_KEY)
      if (cachedData) {
        try {
          setData(JSON.parse(cachedData))
          setIsLoading(false)
          return
        } catch (e) {
          localStorage.removeItem(GEOJSON_CACHE_KEY)
        }
      }
    }

    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        return response.json()
      })
      .then(fetchedData => {
        setData(fetchedData)
        setIsLoading(false)
        try {
          localStorage.setItem(GEOJSON_CACHE_KEY, JSON.stringify(fetchedData))
        } catch (e) {
        }
      })
      .catch(err => {
        console.error('Failed to fetch geojson data:', err)
        setError(`Failed to load map data: ${err.message}`)
        setIsLoading(false)
      })
  }, [url])

  useEffect(() => {
    fetchData(false)
  }, [fetchData])

  const retry = useCallback(() => {
    localStorage.removeItem(GEOJSON_CACHE_KEY)
    fetchData(true)
  }, [fetchData])

  return { data, error, isLoading, retry }
}

export default useGeoJsonData
