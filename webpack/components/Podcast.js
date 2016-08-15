import React from 'react'
import Animate from 'react-animate'
import Sidebar from './Sidebar.js'
import {I18n} from './I18n.js'
import {Card} from './Narrative.js'

let PodcastPlayer = Animate.extend(class PodcastPlayer extends React.Component {
  constructor() {
    super()
    this.state = {
      playing: false,
      creditsVisible: true
    }
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
    this.setState({playing: true})
    if (this.state.creditsVisible) {
      this.hideCredits()
    }
  }
  setPaused() {
    this.setState({playing: false})
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
    let {title, artwork, audio} = this.props
    return (
      <div className="PodcastPlayer" > <div className="artwork"
          style={{backgroundImage: `url(${artwork})`}}>
        </div>
        <div
          className="credits"
          onClick={this.toggleCredits.bind(this)}
        >
          <h1>{title}{ this.state.creditsVisible ? "" : " ▸" }</h1>
          {this.renderHosts()}
        </div>

        <audio
          src={audio}
          controls="controls"
          preload="auto"
          onPlay={this.setPlaying.bind(this)}
          onPause={this.setPaused.bind(this)}
        />

      </div>
    )
  }
})

class Podcast extends React.Component {
  render() {

    return (
      <div className="Podcast">
        <PodcastPlayer
          title={this.props.podcast.title}
          artwork={this.props.podcast.artworkUrl}
          audio={this.props.podcast.audioUrl}
          credits={this.props.podcast.credits}
        />
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

  prepareSave() {
    this.props.handleEdit
  }

  render () {
    let {pages} = this.props
    let description = {__html: this.state.pod.description}

    return (
      <div id="PodcastOverview" className={ `window ${this.props.handleEdit !== null ? 'editing' : ''}` }>

        <Sidebar
          pageTitles={pages.map( (p) => { return p.title } )}
          selectedPage={null}
          {...this.props}
        />

        <Podcast podcast={this.state.pod} />

        <div className="PodcastInfo">
          <div className="Card"
            contentEditable={this.props.handleEdit !== null}
            onBlur={this.prepareSave.bind(this)}
            dangerouslySetInnerHTML={description}
          />
        </div>

      </div>
    )
  }
}
