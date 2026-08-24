/**
 * A custom hook that connects spotlights to the global manager.
 *
 * @providesModule useSpotlightManager
 * 
 */

import * as React from 'react'



export default function useSpotlightManager ({ spotlightKey: key }) {
  const spotlightManager = (window).spotlightManager

  const [visible, setVisible] = React.useState(false)

  const ref = React.useRef()

  React.useEffect(
    () => {
      if (key == null || ref.current == null) return
      const options = { key, ref: (ref) }

      spotlightManager.subscribe(options, visible => setVisible(visible))
      return () => spotlightManager.unsubscribe(options)
    },
    [key, spotlightManager]
  )

  return {
    onAcknowledge,
    ref,
    visible: key == null ? false : visible,
  }

  function onAcknowledge (e) {
    e.stopPropagation()
    if (key == null) return
    spotlightManager.acknowledge(key)
  }
}
