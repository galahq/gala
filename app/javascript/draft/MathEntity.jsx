/**
 * @providesModule MathEntity
 * @noflow
 */

import React from 'react'
import Tex2SVG from "react-hook-mathjax"

const MathEntity = ({ decoratedText }) => {
  return <Tex2SVG display="inline" latex={decoratedText} />
}

export default MathEntity
