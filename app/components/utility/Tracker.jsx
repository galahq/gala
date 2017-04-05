// @flow
import React from 'react'

declare class Ahoy {
  track(name: string, properties: Object): void
}

type TimerState = 'STOPPED' | 'RUNNING' | 'PAUSED'
type TrackerProps = {|
  targetKey: string,
  targetParameters: $Supertype<{name: string}>,
  timerState: TimerState,
|}
type TrackerState = {
  durationSoFar: number,
  timeArrived: number,
}

export default class Tracker extends React.Component {
  props: TrackerProps
  state: TrackerState

  _startTimer: () => void
  _pauseTimer: () => void
  _stopTimer: () => void
  _log: (TrackerState) => void
  _timeSinceArrival: (TrackerState) => number

  _startTimer () {
    this.setState({ timeArrived: Date.now() })
    window.addEventListener('beforeunload', this._log)
  }

  _pauseTimer () {
    this.setState({ durationSoFar: this._timeSinceArrival(this.state) })
  }

  _stopTimer () {
    window.removeEventListener('beforeunload', this._log)
    this._log(this.state)
    this.setState({ durationSoFar: 0 })
  }

  _log (state?: TrackerState = this.state) {
    (window.ahoy: Ahoy).track(
      this.props.targetParameters.name,
      {
        ...this.props.targetParameters,
        duration: this._timeSinceArrival(state),
      }
    )
  }

  _timeSinceArrival (state: TrackerState): number {
    return state.durationSoFar + (Date.now() - state.timeArrived)
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
