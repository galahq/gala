import React from 'react'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import { EditableText } from '@blueprintjs/core'
import EditableAttribute from 'utility/EditableAttribute'
import Statistics from 'utility/Statistics'
import CardContents from 'cards/CardContents'
import { updatePodcast } from 'redux/actions'
import Tracker from 'utility/Tracker'

import { State } from 'redux/state'

function mapStateToProps (state: State, { id }: { id: string }) {
  return {
    podcast: state.podcastsById[id],
    editing: state.edit.inProgress,
    slug: state.caseData.slug,
  }
}

function Podcast ({ podcast, slug, editing, updatePodcast, deleteElement }) {
  let { cardId } = podcast

  return (
    <div className="Podcast">

      <PodcastPlayer
        editing={editing}
        slug={slug}
        updatePodcast={updatePodcast}
        deleteElement={deleteElement}
        {...podcast}
      />

      <div className="PodcastInfo">
        <CardContents nonNarrative id={cardId} />
      </div>
    </div>
  )
}

export default connect(mapStateToProps, { updatePodcast })(Podcast)

class PodcastPlayer extends React.Component {
  constructor () {
    super()
    this.state = {
      playing: false,
    }
  }

  setPlaying () {
    this.setState({
      playing: true,
    })
  }
  setPaused () {
    this.setState({
      playing: false,
    })
  }

  renderHosts () {
    if (!this.props.credits) { return }

    let { guests, hosts, hosts_string: hostsString } = this.props.credits
    let guestList = guests.map((guest, i) => {
      return [
        <dt key={`name${i}`}>{guest.name}</dt>,
        <dd key={`title${i}`}>{guest.title}</dd>,
      ]
    })

    return <div>
      <dl>{guestList}</dl>
      <em>
        <FormattedMessage id="podcast.hosts" values={{ count: hosts.length }} />
        {' '}
        {hostsString}
      </em>
    </div>
  }

  render () {
    let { id, title, artworkUrl, audioUrl, photoCredit, statistics, editing,
      updatePodcast, deleteElement } = this.props
    return (
      <div className="PodcastPlayer pt-dark" >
        {editing && <button
          type="button"
          className="c-delete-element pt-button pt-intent-danger pt-icon-trash"
          onClick={deleteElement}
        >
          Delete Podcast
        </button>}

        <EditableAttribute
          title="Artwork URL"
          value={artworkUrl}
          disabled={!editing}
          onChange={v => updatePodcast(id, { artworkUrl: v })}
        />
        <div
          className="artwork"
          style={{ backgroundImage: `url(${artworkUrl})` }}
        >
          <cite className="o-bottom-right c-photo-credit">
            <EditableText
              multiline
              disabled={!editing}
              value={photoCredit}
              placeholder={editing ? 'Photo credit' : ''}
              onChange={v => updatePodcast(id, { photoCredit: v })}
            />
          </cite>
        </div>

        <div className="credits">
          <h1>
            <EditableText
              multiline
              disabled={!editing}
              value={title}
              onChange={v => updatePodcast(id, { title: v })}
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
          <EditableAttribute
            disabled={!editing}
            title="Audio URL"
            value={audioUrl}
            onChange={v => updatePodcast(id, { audioUrl: v })}
          />
        </div>

      </div>
    )
  }
}
