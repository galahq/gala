import React from 'react'
import { connect } from 'react-redux'
import Icon from 'Icon'

function mapStateToProps(state, ownProps) {
  let { uri } = ownProps
  let {uniques, views, averageTime, updatedAt} = state.statistics[uri] || {}
  return {
    visible: uniques != null,
    uniques,
    views,
    averageTime,
    updatedAt,
  }
}

class Statistics extends React.Component {

  render() {
    let {visible, uniques, views, averageTime, inline} = this.props

    if (!visible)  return null
    return <p className={`o-${inline ? 'tag' : 'bottom-right'} c-statistics`}>

      <Icon filename="ahoy-uniques" className='c-statistics__icon' />
      <span className="c-statistics__uniques">{uniques}</span>

      <Icon filename="ahoy-views" className='c-statistics__icon' />
      <span className="c-statistics__views">{views}</span>

      <Icon filename="ahoy-duration"
        className='c-statistics__icon c-statistics__icon--less-space' />
      <span className="c-statistics__average-time">{averageTime}</span>

    </p>
  }
}

export default connect(mapStateToProps)(Statistics)
