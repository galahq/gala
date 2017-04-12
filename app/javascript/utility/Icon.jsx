import React from 'react'

const Icon = ({ filename, ...props }) => (
  <span
    dangerouslySetInnerHTML={{
      __html: require(`images/${filename}.svg`),
    }}
    {...props}
  />
)

export default Icon
