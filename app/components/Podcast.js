import React from 'react'
import {Trackable} from 'concerns/trackable.js'
import Animate from 'react-animate'
import Sidebar from 'Sidebar.js'
import {I18n} from 'I18n.js'
import {Editable, EditableHTML, EditableAttribute} from 'Editable.js'
import Statistics from 'Statistics.js'

let PodcastPlayer = Animate.extend(class PodcastPlayer extends Trackable {
  eventName() { return "visit_podcast" }

  trackableArgs() { return {
    case_slug: this.props.slug,
    podcast_id: this.props.id
  } }

  newPropsAreDifferent(nextProps) {
    this.props.id !== nextProps.id
  }

  constructor() {
    super()
    this.state = {
      playing: false,
      creditsVisible: true
    }
  }

  componentDidMount() {
    // Not calling super---overriding timer cues.
    window.addEventListener("beforeunload", this.log)
  }

  visibilityChange() {
    // Not calling super---overriding timer cues.
  }

  componentWillUnmount() {
    this.log()
    window.removeEventListener("beforeunload", this.log)
  }

  showCredits() {
    this[Animate['@animate']](
      'podcast-hosts-fade', { maxHeight: 0 }, { maxHeight: 1000 }, 200,
      {onComplete: () => {this.setState({creditsVisible: true})}}
    )
  }
  hideCredits() {
    this[Animate['@animate']](
      'podcast-hosts-fade', { maxHeight: 1000 }, { maxHeight: 0 }, 200,
      {onComplete: () => {this.setState({creditsVisible: false})}}
    )
  }
  toggleCredits() {
    if (this.state.playing && this.state.creditsVisible) {
      this.hideCredits()
    } else if (!this.state.creditsVisible) {
      this.showCredits()
    }
  }

  setPlaying() {
    this.setState({
      playing: true,
      timeArrived: Date.now()
    })
    if (this.state.creditsVisible) {
      this.hideCredits()
    }
  }
  setPaused() {
    this.setState({
      playing: false,
      durationSoFar: this.timeSinceArrival(),
      timeArrived: Date.now()
    })
  }

  renderHosts() {
    if (!this.props.credits) { return }

    let {guests, hosts, hosts_string} = this.props.credits
    let guestList = guests.map((guest) => {
      return [<dt>{guest.name}</dt>, <dd>{guest.title}</dd>]
    })
    let hostMeaningString = hosts.length > 1 ? 'with_hosts' : 'with_host'

    return <div style={this[Animate['@getAnimatedStyle']]('podcast-hosts-fade')}>
      <dl>{guestList}</dl>
      <em><I18n meaning={hostMeaningString} /> {hosts_string}</em>
    </div>
  }

  render() {
    let {id, title, artworkUrl, audioUrl, photoCredit, didSave, statistics} = this.props
    return (
      <div className="PodcastPlayer" >

        <div className="artwork" style={{backgroundImage: `url(${artworkUrl})`}} >
          <EditableAttribute placeholder="Artwork URL"
            uri={`podcasts/${id}:artwork_url`}
            didSave={didSave}>{artworkUrl}</EditableAttribute>

          <Editable placeholder="Photo credit" uri={`podcasts/${id}:photo_credit`} didSave={didSave}>
            <cite className="o-bottom-right c-photo-credit">{photoCredit}</cite>
          </Editable>
        </div>

        <div className="credits" onClick={this.toggleCredits.bind(this)} >
          <h1>
            <Editable uri={`podcasts/${id}:title`} didSave={didSave}><span>{title}</span></Editable>
            { this.state.creditsVisible ? "" : " ▸" }
          </h1>

          {this.renderHosts()}
        </div>

        <Statistics statistics={statistics} inline={true} />

        <audio
          src={audioUrl}
          controls="controls"
          preload="auto"
          onPlay={this.setPlaying.bind(this)}
          onPause={this.setPaused.bind(this)}
        />

        <div><EditableAttribute placeholder="Audio URL"
          uri={`podcasts/${id}:audio_url`}
          didSave={didSave}>{audioUrl}</EditableAttribute></div>

      </div>
    )
  }
})

class Podcast extends React.Component {
  render() {
    let description = {__html: this.props.podcast.description}
    let {podcast, didSave, slug} = this.props
    let {id} = podcast

    return (
      <div className="Podcast">
        <PodcastPlayer slug={slug} didSave={didSave} {...podcast} />

        <div className="PodcastInfo">
          <EditableHTML uri={`podcasts/${id}:description`} placeholder="<!-- HTML podcast description -->" didSave={didSave}>
            <div className="Card"
              dangerouslySetInnerHTML={description}
            />
          </EditableHTML>
        </div>
      </div>
    )
  }
}

export class PodcastOverview extends React.Component {
  constructor() {
    super()
    this.state = {
      pod: {}
    }
  }

  componentDidMount() {
    let pod = this.props.podcasts.find( (p) => {return p.position === parseInt(this.props.params.podcastID)} )
    this.setState ({
      pod: pod
    })
  }

  podcast() {
    return this.props.podcasts.find( (p) => (p.position === parseInt(this.props.params.podcastID)) ) || {}
  }

  prepareSave() {
    this.props.handleEdit
  }

  render () {
    let {pages, didSave, slug} = this.props

    return (
      <div id="PodcastOverview" className={ `window ${this.props.didSave !== null ? 'editing' : ''}` }>

        <Sidebar
          pageTitles={pages.map( (p) => { return p.title } )}
          selectedPage={null}
          {...this.props}
        />

        <Podcast slug={slug} didSave={didSave} podcast={this.podcast()} />

      </div>
    )
  }
}
