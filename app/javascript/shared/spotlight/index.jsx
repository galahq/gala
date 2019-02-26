/**
 * A helpful tooltip shown to onboard new users.
 *
 * @providesModule Spotlight
 * @flow
 */

import * as React from 'react'

import type SpotlightManager from './SpotlightManager'

type Props = {
  children: React.Node,
  content: string,
  spotlightKey: string,
}

export default function Spotlight ({ children, content, spotlightKey }: Props) {
  const { onAcknowledge, ref, visible } = useSpotlightManager({ spotlightKey })
  return (
    <div ref={ref}>
      {visible && (
        <>
          {content}{' '}
          <button data-testid="spotlight-acknowledge" onClick={onAcknowledge}>
            Got it!
          </button>
        </>
      )}
      {children}
    </div>
  )
}

function useSpotlightManager ({ spotlightKey: key }) {
  const spotlightManager: SpotlightManager = (window: any).spotlightManager

  const [visible, setVisible] = React.useState(false)

  const ref = React.useRef()

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
    onAcknowledge: () => spotlightManager.acknowledge(key),
    ref,
    visible,
  }
}
