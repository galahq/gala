/**
 * @providesModule MathEntity
 * @noflow
 */

import React, { useState } from 'react'
import Tex2SVG from "react-hook-mathjax"

export function MathEntity (props) {
  const { decoratedText: latex, editorState, contentState, entityKey, children } = props

  const [error, setError] = useState(null)
  const [isSvg, setIsSvg] = useState(true)

  if (error) {
    console.log({ error })
  }

  const toggleSvg = () => {
    setIsSvg(!isSvg)
  }

  if (isSvg) {
    return (
      <div onClick={toggleSvg}>
        <Tex2SVG
          latex={latex}
          display="inline-block"
          onSuccess={() => setError(null)}
          onError={setError}
        />
      </div>
    )
  } else {
    return (
      <div onClick={toggleSvg}>
        {latex}
      </div>
    )
  }
}

export default MathEntity
