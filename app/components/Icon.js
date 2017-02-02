import React from 'react'

const Icon = ({className, filename}) =>
  <span
    className={className}
    dangerouslySetInnerHTML={{
      __html: require(`../assets/images/react/${filename}.svg`),
    }}
  />

export default Icon
