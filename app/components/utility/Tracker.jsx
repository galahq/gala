// @flow
import React from 'react'
import { findDOMNode } from 'react-dom'
import { connect } from 'react-redux'

declare class Ahoy {
  track(name: string, properties: Object): void
}

type TimerState = "STOPPED" | "RUNNING" | "PAUSED"
type TrackerProps = {|
  caseSlug: string,
  targetKey: string,
  targetParameters: $Supertype<{name: string}>,
  timerState: TimerState,
|}
type TrackerState = {
  durationSoFar: number,
  timeArrived: number,
}

class BaseTracker extends React.Component {
  props: TrackerProps
  state: TrackerState

  _startTimer (): void {
    this.setState({ timeArrived: Date.now() })
    window.addEventListener('beforeunload', this._stopTimer)
  }

  _pauseTimer (): void {
    this.setState({ durationSoFar: this._timeSinceArrival(this.state) })
  }

  _stopTimer (): void {
    window.removeEventListener('beforeunload', this._stopTimer)
    if (this.props.timerState !== 'STOPPED') this._log(this.state)
    this.setState({ durationSoFar: 0 })
  }

  _log (state?: TrackerState = this.state): void {
    (window.ahoy: Ahoy).track(
      this.props.targetParameters.name,
      {
        ...this.props.targetParameters,
        caseSlug: this.props.caseSlug,
        duration: this._timeSinceArrival(state),
      }
    )
  }

  _timeSinceArrival (state: TrackerState): number {
    const thisSegment = this.props.timerState === 'RUNNING'
      ? (Date.now() - state.timeArrived)
      : 0
    return state.durationSoFar + thisSegment
  }

  constructor (props: TrackerProps) {
    super(props)
    this._startTimer = this._startTimer.bind(this)
    this._pauseTimer = this._pauseTimer.bind(this)
    this._stopTimer = this._stopTimer.bind(this)
    this._log = this._log.bind(this)
    this.state = {
      durationSoFar: 0,
      timeArrived: Date.now(),
    }
  }

  componentDidMount () {
    if (this.props.timerState === 'RUNNING') this._startTimer()
  }

  componentWillReceiveProps (nextProps: TrackerProps) {
    if (this.props.timerState === nextProps.timerState &&
      this.props.targetKey === this.props.targetKey) {
      return
    }

    if (this.props.targetKey !== this.props.targetKey) {
      this._stopTimer()
      this._startTimer()
      return
    }

    switch (nextProps.timerState) {
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
    return <span />
  }
}

const Tracker = connect(
  state => ({ caseSlug: state.caseData.slug })
)(BaseTracker)
export default Tracker

// Specializations
//
type OnScreenTrackerProps = {|
  targetKey: string,
  targetParameters: $Supertype<{name: string}>,
|}

type OnScreenTrackerState = {
  isVisible: boolean,
  needsVisibilityCheck: boolean,
  interval?: number,
}

export class OnScreenTracker extends React.Component {
  props: OnScreenTrackerProps
  state: OnScreenTrackerState

  _isVisible (): boolean {
    if (document.hidden) return false

    const self = findDOMNode(this)
    if (self == null) return false

    const threshold = 100
    const rectangle = self.getBoundingClientRect()
    const viewHeight = Math.max(
      document.documentElement.clientHeight,
      window.innerHeight
    )

    const above = rectangle.bottom - threshold < 0
    const below = rectangle.top - viewHeight + threshold >= 0

    return !above && !below
  }

  _checkVisibility (): void {
    this.setState({ isVisible: this._isVisible(), needsVisibilityCheck: false })
  }

  _maybeCheckVisibility (): void {
    if (this.state.needsVisibilityCheck) { this._checkVisibility() }
  }

  _setNeedsCheckVisibility (): void {
    this.setState({ needsVisibilityCheck: true })
  }

  constructor (props: OnScreenTrackerProps) {
    super(props)
    this._isVisible = this._isVisible.bind(this)
    this._checkVisibility = this._checkVisibility.bind(this)
    this._maybeCheckVisibility = this._maybeCheckVisibility.bind(this)
    this._setNeedsCheckVisibility = this._setNeedsCheckVisibility.bind(this)
    this.state = {
      isVisible: false,
      needsVisibilityCheck: false,
    }
  }

  componentDidMount () {
    window.addEventListener('scroll', this._setNeedsCheckVisibility)
    window.addEventListener('visibilitychange', this._checkVisibility)

    this.setState({ interval: setInterval(this._maybeCheckVisibility, 1000) })

    this._setNeedsCheckVisibility()
  }

  componentWillUnmount () {
    window.removeEventListener('scroll', this._setNeedsCheckVisibility)
    window.removeEventListener('visibilitychange', this._checkVisibility)
    if (this.state.interval != null) clearInterval(this.state.interval)
  }

  render () {
    return <Tracker
      timerState={this.state.isVisible ? 'RUNNING' : 'PAUSED'}
      {...this.props}
    />
  }
}
