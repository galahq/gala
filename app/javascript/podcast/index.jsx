/**
 * @providesModule Podcast
 * @flow
 */
import React from 'react'
import { connect } from 'react-redux'

import { EditableText } from '@blueprintjs/core'

import { updatePodcast } from 'redux/actions'

import CreditsList from './CreditsList'
import EditableAttribute from 'utility/EditableAttribute'
import Statistics from 'utility/Statistics'
import Card from 'card'
import Tracker from 'utility/Tracker'

import type { State } from 'redux/state'

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
        <Card nonNarrative id={cardId} />
      </div>
    </div>
  )
}

export default connect(mapStateToProps, { updatePodcast })(Podcast)

class PodcastPlayer extends React.Component {
  state = {
    playing: false,
  }

  handlePlay = () => {
    this.setState({
      playing: true,
    })
  }
  handlePause = () => {
    this.setState({
      playing: false,
    })
  }

  render () {
    let {
      id,
      title,
      artworkUrl,
      audioUrl,
      photoCredit,
      creditsList,
      editing,
      updatePodcast,
      deleteElement,
    } = this.props
    return (
      <div className="PodcastPlayer pt-dark">
        {editing &&
          <button
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

          <CreditsList
            canEdit={editing}
            credits={creditsList}
            onChange={v => updatePodcast(id, { creditsList: v })}
          />
        </div>

        <audio
          src={audioUrl}
          controls="controls"
          preload="auto"
          onPlay={this.handlePlay}
          onPause={this.handlePause}
        />

        <Statistics uri={`podcasts/${id}`} inline={true} />

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
