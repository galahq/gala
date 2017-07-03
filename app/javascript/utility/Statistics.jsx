/**
 * @providesModule Statistics
 * @flow
 */
import React from 'react'
import { connect } from 'react-redux'

import { loadStatistics } from 'redux/actions'

import Icon from './Icon'

import type { State, Statistics as StatisticsType } from 'redux/state'

type OwnProps = { uri: string, inline: boolean }
function mapStateToProps (state: State, ownProps: OwnProps) {
  if (!state.statistics) return { visible: false }

  let { uri } = ownProps
  let statistics = state.statistics[uri]
  return {
    visible: true,
    statistics,
  }
}

type Props =
  | (OwnProps & { visible: false, statistics: null })
  | (OwnProps & {
      visible: true,
      statistics: StatisticsType,
      loadStatistics: string => void,
    })

class Statistics extends React.Component {
  props: Props

  _maybeFetchStatistics = (props: Props) => {
    if (props.visible && !props.statistics) {
      props.loadStatistics(props.uri)
    }
  }

  constructor (props: Props) {
    super(props)
    this._maybeFetchStatistics(props)
  }

  componentWillReceiveProps (nextProps) {
    this._maybeFetchStatistics(nextProps)
  }

  render () {
    const { visible, inline, statistics } = this.props

    if (!visible) return null

    if (!statistics || (statistics && statistics.loaded === false)) {
      return (
        <p
          className={`o-${inline
            ? 'tag'
            : 'bottom-right'} c-statistics pt-skeleton`}
        >
          Loading...
        </p>
      )
    }

    const { uniques, views, averageTime } = statistics
    return (
      <p className={`o-${inline ? 'tag' : 'bottom-right'} c-statistics`}>
        <Icon filename="ahoy-uniques" className="c-statistics__icon" />
        <span className="c-statistics__uniques">
          {uniques}
        </span>

        <Icon filename="ahoy-views" className="c-statistics__icon" />
        <span className="c-statistics__views">
          {views}
        </span>

        <Icon
          filename="ahoy-duration"
          className="c-statistics__icon c-statistics__icon--less-space"
        />
        <span className="c-statistics__average-time">
          {averageTime}
        </span>
      </p>
    )
  }
}

export default connect(mapStateToProps, { loadStatistics })(Statistics)
