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

// type LogCallback = (duration: number) => void
// type TimeSinceArrivalCallback = () => number

function Tracker ({
  caseSlug,
  targetKey,
  targetParameters,
  timerState,
  instantaneous,
  innerRef,
}: TrackerProps) {
  const [durationSoFar, setDurationSoFar] = React.useState<number>(0)
  const [timeArrived, setTimeArrived] = React.useState<number>(Date.now())
  const timerStateRef = React.useRef<TimerState>(timerState)

  const log = React.useMemo<(duration: number) => void>(() => (duration) => {
    const loggedDuration = instantaneous ? 3000 : duration
    if (loggedDuration >= 3000) {
      ;(window.ahoy: Ahoy).track(targetParameters.name, {
        ...targetParameters,
        case_slug: caseSlug,
        duration: loggedDuration,
      })
    }
  }, [targetParameters, caseSlug, instantaneous])

  const timeSinceArrival = React.useMemo<() => number>(() => () => {
    const thisSegment = timerStateRef.current === 'RUNNING' ? Date.now() - timeArrived : 0
    return durationSoFar + thisSegment
  }, [durationSoFar, timeArrived])

  React.useEffect(() => {
    timerStateRef.current = timerState
  }, [timerState])

  const handleBeforeUnload = React.useCallback((): void => {
    const duration = timeSinceArrival()
    if (duration > 0) {
      log(duration)
    }
  }, [timeSinceArrival, log])

  React.useEffect(() => {
    if (timerState === 'RUNNING') {
      setTimeArrived(Date.now())
      window.addEventListener('beforeunload', handleBeforeUnload)
    }
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [timerState, handleBeforeUnload])

  React.useEffect(() => {
    if (timerState === 'PAUSED') {
      setDurationSoFar(timeSinceArrival())
    }
  }, [timerState, timeSinceArrival])

  React.useEffect(() => {
    if (timerState === 'STOPPED') {
      const duration = timeSinceArrival()
      if (duration > 0) {
        log(duration)
      }
      setDurationSoFar(0)
    }
  }, [timerState, timeSinceArrival, log])

  React.useEffect(() => {
    return () => {
      handleBeforeUnload()
    }
  }, [handleBeforeUnload])

  return <span ref={innerRef} />
}

function mapStateToProps ({ caseData }: State) {
  return {
    caseSlug: caseData.slug,
  }
}

// $FlowFixMe
export default connect(
  mapStateToProps,
  () => ({})
)(Tracker)

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
