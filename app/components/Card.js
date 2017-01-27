import React from 'react'
import {findDOMNode} from 'react-dom'

import {Trackable} from 'concerns/trackable.js'

import EdgenotesCard from 'EdgenotesCard.js'
import CardContents from 'CardContents.js'

class Card extends Trackable {
  eventName() { return "read_card" }
  trackableArgs() { return {
    case_slug: this.props.caseSlug,
    card_id: this.props.id,
  } }
  newPropsAreDifferent(nextProps) {
    return this.props.id !== nextProps.id
  }

  isVisible(threshold, mode) {
    let elm = findDOMNode(this)
    threshold = threshold || 100;
    mode = mode || 'visible';

    let rect = elm.getBoundingClientRect();
    let viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
    let above = rect.bottom - threshold < 0;
    let below = rect.top - viewHeight + threshold >= 0;

    return mode === 'above' ? above : (mode === 'below' ? below : !above && !below);
  }

  checkVisibility() {
    if (!this.state.needsCheckVisibility) { return }

    if (this.isVisible()) {
      if (!this.state.visible) { this.startTimer() }
      this.setState({visible: true})
    } else {
      if (this.state.visible) { this.stopTimer() }
      this.setState({visible: false})
    }
    this.setState({ needsCheckVisibility: false })
  }

  constructor() {
    super()
    this.state = {
      visible: false,
    }

    this.setNeedsCheckVisibility = this.setNeedsCheckVisibility.bind(this)
  }

  setNeedsCheckVisibility() { this.setState({needsCheckVisibility: true}) }

  componentDidMount() {
    // Not calling super---overriding timer cues.
    window.addEventListener('scroll',  this.setNeedsCheckVisibility)

    this.setState({
      interval: setInterval(this.checkVisibility.bind(this), 1000),
    })

    this.setNeedsCheckVisibility()
  }

  componentWillUnmount() {
    // Not calling super---overriding timer cues.
    if (this.state.visible) { this.stopTimer() }
    window.removeEventListener('scroll',  this.setNeedsCheckVisibility)
    clearInterval(this.state.interval)
  }

  render() {
    return (
      <section>
        <CardContents id={this.props.id} didSave={this.props.didSave} />
        <EdgenotesCard
          cardId={this.props.id}
          caseSlug={this.props.caseSlug}
          selectedPage={this.props.selectedPage}
          didSave={this.props.didSave}
        />
      </section>
    )
  }
}

export default Card
