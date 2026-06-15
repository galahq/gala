/**
 * @providesModule useEffectOnSubsequentRender
 *
 */

import { useEffect, useRef } from 'react'
export default function useEffectOnSubsequentRender (effect, inputs) {
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
