/**
 * A custom hook that connects spotlights to the global manager.
 *
 * @providesModule useSpotlightManager
 * @flow
 */

import * as React from 'react'

import type SpotlightManager from './SpotlightManager'

type Options = { spotlightKey: string }

export default function useSpotlightManager ({ spotlightKey: key }: Options) {
  const spotlightManager: SpotlightManager = (window: any).spotlightManager

  const [visible, setVisible] = React.useState(false)

  const ref = React.useRef<mixed>()

  React.useEffect(
    () => {
      if (ref.current == null) return
      const options = { key, ref: (ref: any) }

      spotlightManager.subscribe(options, visible => setVisible(visible))
      return () => spotlightManager.unsubscribe(options)
    },
    [key, spotlightManager]
  )

  return {
    onAcknowledge,
    ref,
    visible,
  }

  function onAcknowledge (e: SyntheticMouseEvent<*>) {
    e.stopPropagation()
    spotlightManager.acknowledge(key)
  }
}
