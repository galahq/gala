import React from 'react'

export class Trackable extends React.Component {
  // >> TRACKABLE PROTOCOL >>

  // eventName() -> String
  // Set the event name
  eventName() { return "trackable_event" }

  // trackableArgs() -> Object
  // Set Ahoy::Event@properties to merge with :duration from this prototype
  trackableArgs() { return {} }

  // newPropsAreDifferent(nextProps : Object) -> Bool
  // Compare the current props to the new ones to determine if the component is
  // changing enough that a new event needs to be reported
  newPropsAreDifferent(nextProps) { return nextProps !== this.props }

  // << TRACKABLE PROTOCOL <<

  // WHAT IS BEING TIMED?
  // By default, the timer is started when the component is mounted and ended
  // when it is unmounted. If something else should be timed, override
  // componentDidMount() and componentWillUnmount() and call startTimer() and
  // stopTimer() when needed.

  componentDidMount() {
    this.startTimer()
  }

  componentWillUnmount() {
    this.stopTimer()
  }

  componentWillReceiveProps(nextProps) {
    if (this.newPropsAreDifferent(nextProps)) {
      this.stopTimer()
      this.startTimer()
    }
  }

  constructor() {
    super()
    this.log = this.log.bind(this)
    this.visibilityChange = this.visibilityChange.bind(this)
  }

  timeSinceArrival() {
    let durationSoFar = this.state.durationSoFar || 0
    return durationSoFar + (Date.now() - this.state.timeArrived)
  }

  log() {
    window.ahoy.track(
      this.eventName(),
      Object.assign(this.trackableArgs(), {duration: this.timeSinceArrival()})
    )
  }

  visibilityChange() {
    if (document.hidden) {
      this.setState( {durationSoFar: this.timeSinceArrival(), timeArrived: Date.now()} )
    } else {
      this.setState( {timeArrived: Date.now()} )
    }
  }

  startTimer() {
    this.setState({timeArrived: Date.now()})
    window.addEventListener("beforeunload", this.log)
    document.addEventListener("visibilitychange", this.visibilityChange)
  }

  stopTimer() {
    this.log()
    window.removeEventListener("beforeunload", this.log)
    document.removeEventListener("visibilitychange", this.visibilityChange)
  }

  render() { return <div /> }
}
