import React from 'react'

const Icon = ({ filename, ...props }) =>
  <span
    dangerouslySetInnerHTML={{
      __html: require(`../../assets/images/react/${filename}.svg`),
    }}
    {...props}
  />

export default Icon
