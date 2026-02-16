/* @flow */
import { useEffect } from 'react'

type Params = {
  mapLoaded: boolean,
  mapError: boolean,
  timeoutMs: number,
  onTimeout: () => void,
}

export function useMapLoadTimeout ({
  mapLoaded,
  mapError,
  timeoutMs,
  onTimeout,
}: Params): void {
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!mapLoaded && !mapError) {
        onTimeout()
      }
    }, timeoutMs)

    return () => clearTimeout(timeout)
  }, [mapLoaded, mapError, onTimeout, timeoutMs])
}

export default useMapLoadTimeout
