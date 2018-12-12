/**
 * @providesModule Tracker
 * @flow
 */

import * as React from 'react'
import { connect } from 'react-redux'

import type { State } from 'redux/state'

declare class Ahoy {
  track(name: string, properties: Object): void;
}

type TimerState = 'STOPPED' | 'RUNNING' | 'PAUSED'
type TrackerProps = {
  caseSlug?: string,
  targetKey: string,
  targetParameters: $Supertype<{ name: string }>,
  timerState: TimerState,
  instantaneous?: boolean,
  innerRef?: (?HTMLSpanElement) => any,
}
type TrackerState = {
  durationSoFar: number,
  timeArrived: number,
}

class BaseTracker extends React.Component<TrackerProps, TrackerState> {
  state = {
    durationSoFar: 0,
    timeArrived: Date.now(),
  }

  _startTimer = () => {
    this.setState({ timeArrived: Date.now() })
    window.addEventListener('beforeunload', this._stopTimer)
  }

  _pauseTimer = () => {
    this.setState({ durationSoFar: this._timeSinceArrival(this.state) })
  }

  _stopTimer = () => {
    window.removeEventListener('beforeunload', this._stopTimer)
    const duration = this._timeSinceArrival(this.state)
    if (duration > 0) this._log(duration)
    this.setState({ durationSoFar: 0 })
  }

  _log = (duration: number) => {
    const { targetParameters, caseSlug, instantaneous } = this.props

    const loggedDuration = instantaneous ? 3000 : duration
    if (loggedDuration >= 3000) {
      ;(window.ahoy: Ahoy).track(targetParameters.name, {
        ...targetParameters,
        case_slug: caseSlug,
        duration: loggedDuration,
      })
    }
  }

  _timeSinceArrival (state: TrackerState) {
    const thisSegment =
      this.props.timerState === 'RUNNING' ? Date.now() - state.timeArrived : 0
    return state.durationSoFar + thisSegment
  }

  componentDidMount = () => {
    if (this.props.timerState === 'RUNNING') this._startTimer()
  }

  componentDidUpdate (prevProps: TrackerProps) {
    if (
      prevProps.timerState === this.props.timerState &&
      prevProps.targetKey === this.props.targetKey
    ) {
      return
    }

    if (prevProps.targetKey !== this.props.targetKey) {
      this._stopTimer()
      this._startTimer()
      return
    }

    switch (this.props.timerState) {
      case 'RUNNING':
        this._startTimer()
        break

      case 'PAUSED':
        this._pauseTimer()
        break

      case 'STOPPED':
        this._stopTimer()
        break
    }
  }

  componentWillUnmount () {
    this._stopTimer()
  }

  render () {
    return <span ref={this.props.innerRef} />
  }
}

function mapStateToProps ({ caseData }: State) {
  return {
    caseSlug: caseData.slug,
  }
}
// $FlowFixMe
const Tracker = connect(
  mapStateToProps,
  () => ({})
)(BaseTracker)
export default Tracker

// Specializations
//
type OnScreenTrackerProps = {|
  targetKey: string,
  targetParameters: $Supertype<{ name: string }>,
|}

type OnScreenTrackerState = {
  isVisible: boolean,
  needsVisibilityCheck: boolean,
  interval?: IntervalID,
}

export class OnScreenTracker extends React.Component<
  OnScreenTrackerProps,
  OnScreenTrackerState
> {
  node: ?HTMLElement

  state = {
    isVisible: false,
    needsVisibilityCheck: false,
  }

  _isVisible = () => {
    if (document.hidden) return false

    if (this.node == null || this.node instanceof Text) return false

    const rectangle = this.node.getBoundingClientRect()
    const threshold = 100

    if (document.documentElement == null) return false
    const viewHeight = Math.max(
      document.documentElement.clientHeight,
      window.innerHeight
    )

    const above = rectangle.bottom - threshold < 0
    const below = rectangle.top - viewHeight + threshold >= 0

    return !above && !below
  }

  _checkVisibility = () => {
    this.setState({
      isVisible: this._isVisible(),
      needsVisibilityCheck: false,
    })
  }

  _maybeCheckVisibility = () => {
    if (this.state.needsVisibilityCheck) {
      this._checkVisibility()
    }
  }

  _setNeedsCheckVisibility = () => {
    this.setState({ needsVisibilityCheck: true })
  }

  componentDidMount () {
    window.addEventListener('scroll', this._setNeedsCheckVisibility)
    window.addEventListener('visibilitychange', this._checkVisibility)

    this.setState({ interval: setInterval(this._maybeCheckVisibility, 500) })

    this._setNeedsCheckVisibility()
  }

  componentWillUnmount () {
    window.removeEventListener('scroll', this._setNeedsCheckVisibility)
    window.removeEventListener('visibilitychange', this._checkVisibility)
    if (this.state.interval != null) clearInterval(this.state.interval)
  }

  render () {
    return (
      <Tracker
        timerState={this.state.isVisible ? 'RUNNING' : 'PAUSED'}
        innerRef={el => (this.node = el)}
        {...this.props}
      />
    )
  }
}
