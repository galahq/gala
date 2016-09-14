import React from 'react'

class LoadingIcon extends React.Component {
  render() {
    return (
      <div className="loading-icon" dangerouslySetInnerHTML={{__html: require('loading.svg')}} />
    )
  }
}

export default LoadingIcon
