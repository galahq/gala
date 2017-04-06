import React from 'react'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import { EditableText } from '@blueprintjs/core'
import EditableAttribute from 'EditableAttribute'
import Statistics from 'Statistics'
import CardContents from 'CardContents'
import { updatePodcast } from 'redux/actions'
import Tracker from 'utility/Tracker'

function mapStateToProps(state, {id}) {
  return {
    podcast: state.podcastsById[id],
    editing: state.edit.inProgress,
    slug: state.caseData.slug,
  }
}

class Podcast extends React.Component {
  render() {
    let {podcast, slug, editing, updatePodcast, deleteElement} = this.props
    let {cardId} = podcast

    return (
      <div className="Podcast">

        <PodcastPlayer {...{editing, slug, updatePodcast, deleteElement}}
          {...podcast} />

        <div className="PodcastInfo">
          <CardContents id={cardId} nonNarrative />
        </div>
      </div>
    )
  }
}

export default connect(mapStateToProps, {updatePodcast})(Podcast)

let PodcastPlayer = class PodcastPlayer extends React.Component {
  constructor() {
    super()
    this.state = {
      playing: false,
    }
  }

  setPlaying() {
    this.setState({
      playing: true,
    })
  }
  setPaused() {
    this.setState({
      playing: false,
    })
  }

  renderHosts() {
    if (!this.props.credits) { return }

    let {guests, hosts, hosts_string} = this.props.credits
    let guestList = guests.map((guest) => {
      return [<dt>{guest.name}</dt>, <dd>{guest.title}</dd>]
    })

    return <div>
      <dl>{guestList}</dl>
      <em>
        <FormattedMessage id="podcast.hosts" values={{count: hosts.length}} />
        {" "}
        {hosts_string}
      </em>
    </div>
  }

  render() {
    let {id, title, artworkUrl, audioUrl, photoCredit, statistics, editing,
      updatePodcast, deleteElement} = this.props
    return (
      <div className="PodcastPlayer pt-dark" >
        {editing && <button type="button"
          onClick={deleteElement}
          className="c-delete-element pt-button pt-intent-danger pt-icon-trash">
          Delete Podcast
        </button>}

      <EditableAttribute title="Artwork URL"
        value={artworkUrl}
        onChange={v => updatePodcast(id, { artworkUrl: v})}
        disabled={!editing} />
        <div className="artwork" style={{backgroundImage: `url(${artworkUrl})`}} >
          <cite className="o-bottom-right c-photo-credit">
            <EditableText disabled={!editing} multiline value={photoCredit}
              onChange={v => updatePodcast(id, { photoCredit: v})}
              placeholder={editing ? "Photo credit" : ""} />
          </cite>
        </div>

        <div className="credits">
          <h1>
            <EditableText disabled={!editing} multiline value={title}
              onChange={v => updatePodcast(id, { title: v})}
            />
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

        <Tracker
          timerState={this.state.playing ? 'RUNNING' : 'PAUSED'}
          targetKey={`podcast/${id}`}
          targetParameters={{
            name: 'visit_podcast',
            podcast_id: id,
          }}
        />

      <div>
        <EditableAttribute disabled={!editing} title="Audio URL"
          onChange={v => updatePodcast(id, { audioUrl: v})}
          value={audioUrl} />
      </div>

    </div>
    )
  }
}
