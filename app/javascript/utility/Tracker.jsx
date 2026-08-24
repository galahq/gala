/**
 * @providesModule Tracker
 *
 */

import * as React from 'react'
import { connect } from 'react-redux'
import { trackEvent } from 'shared/analytics'

class BaseTracker extends React.Component {
  state = {
    durationSoFar: 0,
    timeArrived: Date.now(),
    hasAutoLogged: false,
  }

  _autoLogTimerId = null

  _autoLogAfterMs = () => {
    const { autoLogAfterMs } = this.props
    if (autoLogAfterMs == null) return null

    const parsed = parseInt(autoLogAfterMs, 10)
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null
  }

  _startTimer = () => {
    this.setState({
      timeArrived: Date.now(),
      hasAutoLogged: false,
    })
    window.addEventListener('beforeunload', this._stopTimer)
    this._startAutoLogTimer()
  }

  _startAutoLogTimer = () => {
    const autoLogAfterMs = this._autoLogAfterMs()
    if (autoLogAfterMs == null || this._autoLogTimerId != null) return

    this._autoLogTimerId = window.setInterval(() => {
      if (this.props.timerState !== 'RUNNING') return
      if (this.state.hasAutoLogged) return

      const duration = this._timeSinceArrival(this.state)
      if (duration >= autoLogAfterMs) {
        this.setState({ hasAutoLogged: true })
        this._log(duration)
        this._clearAutoLogTimer()
      }
    }, 500)
  }

  _pauseTimer = () => {
    this.setState({ durationSoFar: this._timeSinceArrival(this.state) })
  }

  _clearAutoLogTimer = () => {
    if (this._autoLogTimerId == null) return
    clearInterval(this._autoLogTimerId)
    this._autoLogTimerId = null
  }

  _stopTimer = () => {
    window.removeEventListener('beforeunload', this._stopTimer)
    this._clearAutoLogTimer()
    const duration = this._timeSinceArrival(this.state)
    if (!this.state.hasAutoLogged && duration > 0) this._log(duration)
    this.setState({ durationSoFar: 0 })
  }

  _log = (duration) => {
    const { targetParameters, caseSlug, instantaneous } = this.props

    const loggedDuration = instantaneous ? 3000 : duration
    if (loggedDuration >= 3000) {
      trackEvent(targetParameters.name, {
        ...targetParameters,
        case_slug: caseSlug,
        duration: loggedDuration,
      })
    }
  }

  _timeSinceArrival (state) {
    const thisSegment =
      this.props.timerState === 'RUNNING' ? Date.now() - state.timeArrived : 0
    return state.durationSoFar + thisSegment
  }

  componentDidMount = () => {
    if (this.props.timerState === 'RUNNING') this._startTimer()
  }

  componentDidUpdate (prevProps) {
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
    this._clearAutoLogTimer()
    this._stopTimer()
  }

  render () {
    return <span ref={this.props.innerRef} />
  }
}

function mapStateToProps ({ caseData }) {
  return {
    caseSlug: caseData.slug,
  }
}
const Tracker = connect(
  mapStateToProps,
  () => ({})
)(BaseTracker)
export default Tracker

// Specializations
//

export class OnScreenTracker extends React.Component {
  node

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
