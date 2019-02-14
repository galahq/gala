/**
 * Custom hook for tracking the onscreen size of an element
 *
 * @noflow
 * @providesModule useElementSize
 */

import { useRef, useState, useEffect } from 'react'
import ResizeObserver from 'resize-observer-polyfill'

export default function useElementSize () {
  const ref = useRef()

  const [bounds, setBounds] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  })

  const [resizeObserver] = useState(
    () => new ResizeObserver(([entry]) => setBounds(entry.contentRect))
  )

  useEffect(() => {
    ref.current && resizeObserver.observe(ref.current)
    return () => resizeObserver.disconnect()
  }, [])

  return [bounds, ref]
}
