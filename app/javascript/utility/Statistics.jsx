/**
 * @providesModule Statistics
 * @flow
 */
import * as React from 'react'
import { connect } from 'react-redux'

import { loadStatistics } from 'redux/actions'

import Icon from './Icon'

import type { State, Statistics as StatisticsType } from 'redux/state'

type OwnProps = {| uri: string, inline?: boolean |}

type StateProps =
  | {| visible: false, statistics: { loaded: false } |}
  | {|
      visible: true,
      statistics: StatisticsType,
    |}
function mapStateToProps (state: State, ownProps: OwnProps): StateProps {
  if (!state.statistics) {
    return { visible: false, statistics: { loaded: false }}
  }

  let { uri } = ownProps
  let statistics = state.statistics[uri]
  return {
    visible: true,
    statistics,
  }
}

type Props = {|
  ...OwnProps,
  ...StateProps,
  loadStatistics: typeof loadStatistics,
|}

class Statistics extends React.Component<Props> {
  static defaultProps = { inline: false }

  _maybeFetchStatistics = (props: Props) => {
    if (props.visible && !props.statistics) {
      props.loadStatistics(props.uri)
    }
  }

  constructor (props: Props) {
    super(props)
    this._maybeFetchStatistics(props)
  }

  render () {
    const { visible, inline } = this.props
    if (!visible || !this.props.statistics) return null

    if (this.props.statistics && this.props.statistics.loaded === false) {
      return (
        <p
          className={`o-${
            inline ? 'tag' : 'bottom-right'
          } c-statistics bp3-skeleton`}
        >
          Loading...
        </p>
      )
    }

    const { uniques, views, averageTime } = this.props.statistics
    return (
      <p
        className={`non-spaced o-${
          inline ? 'tag' : 'bottom-right'
        } c-statistics`}
      >
        <Icon filename="ahoy-uniques" className="c-statistics__icon" />
        <span className="c-statistics__uniques">{uniques}</span>

        <Icon filename="ahoy-views" className="c-statistics__icon" />
        <span className="c-statistics__views">{views}</span>

        <Icon
          filename="ahoy-duration"
          className="c-statistics__icon c-statistics__icon--less-space"
        />
        <span className="c-statistics__average-time">{averageTime}</span>
      </p>
    )
  }
}

// $FlowFixMe
export default connect(
  mapStateToProps,
  { loadStatistics }
)(Statistics)
