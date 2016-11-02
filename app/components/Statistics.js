import React from 'react'

export class Statistics extends React.Component {

  render() {
    if (this.props.statistics === undefined) { return <span /> }
    let {uniques, views, averageTime} = this.props.statistics
    return <p className={`o-${this.props.inline ? 'tag' : 'bottom-right'} c-statistics`}>
      <span className='c-statistics__icon'
        dangerouslySetInnerHTML={{__html: require('../assets/images/react/ahoy-uniques.svg')}} />
      {uniques}
      <span className='c-statistics__icon'
        dangerouslySetInnerHTML={{__html: require('../assets/images/react/ahoy-views.svg')}} />
      {views}
      <span className='c-statistics__icon c-statistics__icon--less-space'
        dangerouslySetInnerHTML={{__html: require('../assets/images/react/ahoy-duration.svg')}} />
      {averageTime}
    </p>
  }

}
