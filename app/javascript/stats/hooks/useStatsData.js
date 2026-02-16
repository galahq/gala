/* @flow */
import { useState, useEffect, useRef, useCallback } from 'react'
import {
  fetchStats,
  fetchWithTimeout,
} from '../api'
import type {
  StatsData,
  StatsDateRange,
  StatsDateRangeParams,
} from '../types'

declare class AbortController {
  signal: {
    aborted: boolean,
    addEventListener?: (event: 'abort', callback: () => mixed) => mixed,
    removeEventListener?: (event: 'abort', callback: () => mixed) => mixed,
    ...
  };
  abort(): void;
}

type Params = {
  dataUrl: string,
  dateRange: StatsDateRange,
}

type UseStatsDataResult = {
  data: ?StatsData,
  isLoading: boolean,
  isInitialLoad: boolean,
  error: ?Error,
  retry: () => void,
}

export function useStatsData ({ dataUrl, dateRange }: Params): UseStatsDataResult {
  const [data, setData] = useState<?StatsData>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true)
  const [error, setError] = useState<?Error>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const isInitialLoadRef = useRef<boolean>(true)

  const retry = useCallback(() => {
    setRefreshKey(prev => prev + 1)
  }, [])

  useEffect(() => {
    const abortController = new AbortController()

    const fetchData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const params: StatsDateRangeParams = {}
        if (dateRange.from) params.from = dateRange.from
        if (dateRange.to) params.to = dateRange.to

        const nextData = await fetchWithTimeout(
          fetchStats(dataUrl, params, abortController.signal),
          15000
        )

        setData(nextData)
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
    isLoading,
    isInitialLoad,
    error,
    retry,
  }
}

export default useStatsData
