/**
 * @providesModule Icon
 * @flow
 */
import React from 'react'

type Props = { filename: string }
const Icon = ({ filename, ...props }: Props) => (
  <span
    dangerouslySetInnerHTML={{
      __html: require(`images/${filename}.svg`),
    }}
    {...props}
  />
)

export default Icon
