/**
 * @providesModule Podcast
 * @flow
 */
import * as React from 'react'
import { connect } from 'react-redux'

import ActiveStorageProvider from 'react-activestorage-provider'
import { EditableText } from '@blueprintjs/core'
import { FormattedMessage } from 'react-intl'

import { updatePodcast, displayErrorToast } from 'redux/actions'
import { formatErrors } from 'shared/orchard'

import CreditsList from './CreditsList'
import Lock from 'utility/Lock'
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
  displayErrorToast: typeof displayErrorToast,
  deleteElement: () => void,
}
function Podcast ({
  podcast,
  slug,
  editing,
  updatePodcast,
  displayErrorToast,
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
        displayErrorToast={displayErrorToast}
        {...podcast}
      />

      <div className="PodcastInfo spaced">
        <Card nonNarrative id={`${cardId}`} />

        {editing && (
          <button
            type="button"
            className="c-delete-element bp3-button bp3-intent-danger bp3-icon-trash"
            onClick={deleteElement}
          >
            <FormattedMessage id="podcasts.destroy.deletePodcast" />
          </button>
        )}
      </div>
    </div>
  )
}

// $FlowFixMe
export default connect(
  mapStateToProps,
  { updatePodcast, displayErrorToast }
)(Podcast)

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
      displayErrorToast,
    } = this.props
    return (
      <div className="PodcastPlayer bp3-dark">
        <Lock type="Podcast" param={id}>
          {({ onBeginEditing, onFinishEditing }) => (
            <>
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
                    onError={error => {
                      error
                        .json()
                        .then(formatErrors)
                        .then(displayErrorToast)
                    }}
                  />
                )}

                <cite className="o-bottom-right c-photo-credit">
                  <EditableText
                    multiline
                    disabled={!editing}
                    value={photoCredit}
                    placeholder={editing ? 'Photo credit' : ''}
                    onChange={v => updatePodcast(`${id}`, { photoCredit: v })}
                    onEdit={onBeginEditing}
                    onCancel={onFinishEditing}
                    onConfirm={onFinishEditing}
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
                    onEdit={onBeginEditing}
                    onCancel={onFinishEditing}
                    onConfirm={onFinishEditing}
                  />
                </h1>

                <CreditsList
                  canEdit={editing}
                  credits={creditsList}
                  onChange={v => updatePodcast(`${id}`, { creditsList: v })}
                  onStartEditing={onBeginEditing}
                  onFinishEditing={onFinishEditing}
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

                {audioUrl && (
                  <audio
                    src={audioUrl}
                    controls="controls"
                    preload="auto"
                    onPlay={this.handlePlay}
                    onPause={this.handlePause}
                  />
                )}
              </div>

              <Statistics
                inline
                key={`podcasts/${id}`}
                uri={`podcasts/${id}`}
              />

              <Tracker
                timerState={this.state.playing ? 'RUNNING' : 'PAUSED'}
                targetKey={`podcast/${id}`}
                targetParameters={{
                  name: 'visit_podcast',
                  podcast_id: id,
                }}
              />
            </>
          )}
        </Lock>
      </div>
    )
  }
}
