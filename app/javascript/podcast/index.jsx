/**
 * @providesModule Podcast
 * @flow
 */
import * as React from 'react'
import { connect } from 'react-redux'

import ActiveStorageProvider from 'react-activestorage-provider'
import { EditableText } from '@blueprintjs/core'
import { FormattedMessage } from 'react-intl'

import { updatePodcast } from 'redux/actions'

import CreditsList from './CreditsList'
import Statistics from 'utility/Statistics'
import Card from 'card'
import Tracker from 'utility/Tracker'
import FileUploadWidget, {
  PositionedFileUploadWidget,
} from 'utility/FileUploadWidget'

import type { State, Podcast as PodcastT } from 'redux/state'

function mapStateToProps (state: State, { id }: { id: string }) {
  return {
    podcast: state.podcastsById[id],
    editing: state.edit.inProgress,
    slug: state.caseData.slug,
  }
}

type Props = {
  podcast: PodcastT,
  slug: string,
  editing: boolean,
  updatePodcast: typeof updatePodcast,
  deleteElement: () => void,
}
function Podcast ({
  podcast,
  slug,
  editing,
  updatePodcast,
  deleteElement,
}: Props) {
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

      <div className="PodcastInfo spaced">
        <Card nonNarrative id={`${cardId}`} />

        {editing && (
          <button
            type="button"
            className="c-delete-element pt-button pt-intent-danger pt-icon-trash"
            onClick={deleteElement}
          >
            <FormattedMessage id="podcasts.destroy.deletePodcast" />
          </button>
        )}
      </div>
    </div>
  )
}

export default connect(mapStateToProps, { updatePodcast })(Podcast)

class PodcastPlayer extends React.Component<*, { playing: boolean }> {
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
    } = this.props
    return (
      <div className="PodcastPlayer pt-dark">
        <div
          className="artwork"
          style={{
            backgroundImage: `url(${artworkUrl})`,
            position: 'relative',
          }}
        >
          {editing && (
            <ActiveStorageProvider
              endpoint={{
                path: `/podcasts/${id}`,
                model: 'Podcast',
                attribute: 'artwork',
                method: 'PUT',
              }}
              render={renderProps => (
                <PositionedFileUploadWidget
                  message={{ id: 'podcasts.edit.uploadArtwork' }}
                  {...renderProps}
                />
              )}
              onSubmit={({ artworkUrl }: PodcastT) =>
                updatePodcast(`${id}`, { artworkUrl }, false)
              }
            />
          )}

          <cite className="o-bottom-right c-photo-credit">
            <EditableText
              multiline
              disabled={!editing}
              value={photoCredit}
              placeholder={editing ? 'Photo credit' : ''}
              onChange={v => updatePodcast(`${id}`, { photoCredit: v })}
            />
          </cite>
        </div>

        <div className="credits">
          <h1>
            <EditableText
              multiline
              disabled={!editing}
              value={title}
              onChange={v => updatePodcast(`${id}`, { title: v })}
            />
          </h1>

          <CreditsList
            canEdit={editing}
            credits={creditsList}
            onChange={v => updatePodcast(`${id}`, { creditsList: v })}
          />
        </div>

        <div className="spaced">
          {editing && (
            <ActiveStorageProvider
              endpoint={{
                path: `/podcasts/${id}`,
                model: 'Podcast',
                attribute: 'audio',
                method: 'PUT',
              }}
              render={renderProps => (
                <FileUploadWidget
                  accept="audio/*"
                  message={{ id: 'podcasts.edit.uploadPodcast' }}
                  {...renderProps}
                />
              )}
              onSubmit={({ audioUrl }: PodcastT) =>
                updatePodcast(`${id}`, { audioUrl }, false)
              }
            />
          )}

          <audio
            src={audioUrl}
            controls="controls"
            preload="auto"
            onPlay={this.handlePlay}
            onPause={this.handlePause}
          />
        </div>

        <Statistics uri={`podcasts/${id}`} inline={true} />

        <Tracker
          timerState={this.state.playing ? 'RUNNING' : 'PAUSED'}
          targetKey={`podcast/${id}`}
          targetParameters={{
            name: 'visit_podcast',
            podcast_id: id,
          }}
        />
      </div>
    )
  }
}
