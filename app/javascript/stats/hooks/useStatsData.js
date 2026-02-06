/* @flow */
import { useState, useEffect, useRef, useCallback } from 'react'
import {
  fetchStats,
  fetchAllTimeStats,
  fetchWithTimeout,
  extractAllTimeStats,
  extractMeta,
  validatePayload,
} from '../api'

import type {
  AllTimeStats,
  MetaPayload,
  BinsPayload,
  RangePayload,
  CountryPayload,
} from '../api'

declare class AbortController {
  signal: { aborted: boolean, ... };
  abort(): void;
}

type StatsData = {
  countries: Array<CountryPayload>,
  summary: Object,
  bins: BinsPayload,
  meta: MetaPayload,
  range: RangePayload,
}

type DateRange = {
  from: ?string,
  to: ?string,
}

type Params = {
  dataUrl: string,
  dateRange: DateRange,
}

type UseStatsDataResult = {
  data: ?StatsData,
  allTimeStats: ?AllTimeStats,
  meta: ?MetaPayload,
  isLoading: boolean,
  isInitialLoad: boolean,
  error: ?Error,
  retry: () => void,
}

export function useStatsData ({
  dataUrl,
  dateRange,
}: Params): UseStatsDataResult {
  const [data, setData] = useState<?StatsData>(null)
  const [allTimeStats, setAllTimeStats] = useState<?AllTimeStats>(null)
  const [meta, setMeta] = useState<?MetaPayload>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true)
  const [error, setError] = useState<?Error>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const isInitialLoadRef = useRef<boolean>(true)

  const retry = useCallback(() => {
    setRefreshKey(prev => prev + 1)
  }, [])

  useEffect(() => {
    fetchAllTimeStats(dataUrl)
      .then(payload => {
        setAllTimeStats(extractAllTimeStats(payload))
        setMeta(extractMeta(payload))
      })
      .catch(err => {
        console.error('Error fetching all-time stats:', err)
        setAllTimeStats({ total_visits: 0, country_count: 0 })
      })
  }, [dataUrl])

  useEffect(() => {
    const abortController = new AbortController()

    const fetchData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const params = {}
        if (dateRange.from) params.from = dateRange.from
        if (dateRange.to) params.to = dateRange.to

        const payload = await fetchWithTimeout(
          fetchStats(
            dataUrl,
            params,
            abortController.signal
          ),
          15000
        )

        const validation = validatePayload(payload)

        if (!validation.valid) {
          throw new Error(validation.error)
        }

        setData({
          countries: validation.countries,
          summary: validation.summary,
          bins: validation.bins,
          meta: validation.meta,
          range: validation.range,
        })

        if (validation.meta && Object.keys(validation.meta).length > 0) {
          setMeta(validation.meta)
        }
      } catch (err) {
        if (err.name === 'AbortError') {
          return
        }
        console.error('Error fetching stats:', err)
        setError(err)
        setData(null)
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false)
          if (isInitialLoadRef.current) {
            isInitialLoadRef.current = false
            setIsInitialLoad(false)
          }
        }
      }
    }

    fetchData()

    return () => abortController.abort()
  }, [dataUrl, dateRange.from, dateRange.to, refreshKey])

  return {
    data,
    allTimeStats,
    meta,
    isLoading,
    isInitialLoad,
    error,
    retry,
  }
}

export default useStatsData
