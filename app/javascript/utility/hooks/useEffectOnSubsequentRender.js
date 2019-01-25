/**
 * @providesModule useEffectOnSubsequentRender
 * @flow
 */

import { useEffect, useRef } from 'react'
export default function useEffectOnSubsequentRender (effect: any, inputs: any) {
  const hasBeenCalled = useRef(false)

  useEffect(() => {
    let maybeCleanupFn
    if (hasBeenCalled.current) {
      maybeCleanupFn = effect()
    }

    hasBeenCalled.current = true

    return maybeCleanupFn
  }, inputs)
}
