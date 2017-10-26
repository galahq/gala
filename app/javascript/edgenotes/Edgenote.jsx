/**
 * @providesModule Edgenote
 * @flow
 */

import * as React from 'react'
import styled from 'styled-components'
import { connect } from 'react-redux'
import ImageZoom from 'react-medium-image-zoom'
import YoutubePlayer from 'react-youtube-player'
import { EditableText } from '@blueprintjs/core'

import Statistics from 'utility/Statistics'
import Tracker from 'utility/Tracker'
import EditableAttribute from 'utility/EditableAttribute'

import {
  highlightEdgenote,
  activateEdgenote,
  updateEdgenote,
} from 'redux/actions'

import type { State, Edgenote } from 'redux/state'

type OwnProps = { slug: string }
function mapStateToProps (state: State, { slug }: OwnProps) {
  return {
    editing: state.edit.inProgress,
    selected: slug === state.ui.highlightedEdgenote,
    active: slug === state.ui.activeEdgenote,
    contents: state.edgenotesBySlug[slug],
  }
}

function mapDispatchToProps (dispatch: *, { slug }: OwnProps) {
  return {
    activate: () => dispatch(activateEdgenote(slug)),
    deactivate: () => dispatch(activateEdgenote(null)),
    onMouseOver: () => dispatch(highlightEdgenote(slug)),
    onMouseOut: () => dispatch(highlightEdgenote(null)),
    onChange: attr => value =>
      dispatch(updateEdgenote(slug, { [attr]: value })),
  }
}

function mergeProps (stateProps, dispatchProps, ownProps) {
  return {
    ...stateProps,
    ...dispatchProps,
    ...ownProps,
    activate: stateProps.editing ? () => {} : dispatchProps.activate,
  }
}

class EdgenoteFigure extends React.Component<{
  contents: ?Edgenote,
  selected: boolean,
  active: boolean,
  editing: boolean,
  activate: () => Promise<any>,
  deactivate: () => Promise<any>,
  onMouseOver: () => Promise<any>,
  onMouseOut: () => Promise<any>,
  onChange: string => any => Promise<any>,
}> {
  componentDidUpdate (prevProps) {
    if (!prevProps.active && this.props.active) {
      const { contents } = this.props
      if (contents && contents.callToAction && contents.websiteUrl) {
        window.open(contents.websiteUrl, '_blank')
        setTimeout(() => {
          this.props.deactivate()
        }, 300)
      }
    }
  }

  render () {
    const {
      contents,
      selected,
      active,
      activate,
      deactivate,
      onMouseOver,
      onMouseOut,
      editing,
      onChange,
    } = this.props
    if (!contents) return null

    const {
      slug,
      caption,
      youtubeSlug,
      pullQuote,
      imageUrl,
      callToAction,
      websiteUrl,
      audioUrl,
      attribution,
      altText,
      photoCredit,
    } = contents

    const isALink = !youtubeSlug && !audioUrl && !!callToAction && !editing

    const ConditionalLink = isALink ? 'a' : 'div'
    const conditionalHoverCallbacks = isALink
      ? {
        onMouseEnter: onMouseOver,
        onMouseLeave: onMouseOut,
      }
      : {}

    const reduxProps = { active, activate, deactivate, editing, selected }

    const Or =
      editing && !youtubeSlug && !pullQuote && !audioUrl && !imageUrl
        ? () => <label>or</label>
        : () => null

    return (
      <figure className="edge" id={slug} {...conditionalHoverCallbacks}>
        <Statistics inline uri={`edgenotes/${slug}`} />
        <ConditionalLink
          tabIndex={isALink ? '0' : false}
          onClick={active ? () => {} : activate}
        >
          {!!pullQuote ||
            !!imageUrl ||
            !!audioUrl || (
              <YouTube
                slug={youtubeSlug}
                onChange={onChange('youtubeSlug')}
                {...reduxProps}
              />
            )}

          <Or />

          {!!youtubeSlug ||
            !!imageUrl || (
              <Background visible={!!audioUrl}>
                <PullQuote
                  contents={pullQuote}
                  {...reduxProps}
                  onChange={onChange('pullQuote')}
                />
                <Attribution
                  name={attribution}
                  {...reduxProps}
                  onChange={onChange('attribution')}
                />
              </Background>
            )}
          {!!youtubeSlug ||
            !!imageUrl || (
              <AudioPlayer
                src={audioUrl}
                {...reduxProps}
                onChange={onChange('audioUrl')}
              />
            )}

          <Or />

          {!!youtubeSlug ||
            !!pullQuote ||
            !!audioUrl || (
              <Image
                src={imageUrl}
                alt={altText}
                photoCredit={photoCredit}
                callToAction={callToAction}
                {...reduxProps}
                onChange={onChange}
              />
            )}

          <Caption
            contents={caption}
            {...reduxProps}
            {...(pullQuote ? { selected: false } : {})}
            onChange={onChange('caption')}
          />
          {!!youtubeSlug ||
            !!audioUrl || (
              <CallToAction
                websiteUrl={websiteUrl}
                contents={callToAction}
                {...reduxProps}
                onChange={onChange}
              />
            )}
        </ConditionalLink>

        <Tracker
          timerState={active ? 'RUNNING' : 'STOPPED'}
          targetKey={`edgenotes/${slug}`}
          targetParameters={{
            name: 'visit_edgenote',
            edgenoteSlug: slug,
          }}
          instantaneous={isALink}
        />
      </figure>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(
  EdgenoteFigure
)

const YouTube = ({ slug, active, activate, deactivate, editing, onChange }) => (
  <div>
    {slug && (
      <YoutubePlayer
        videoId={slug}
        playbackState={active ? 'playing' : 'paused'}
        configuration={{
          theme: 'light',
        }}
        onPlay={activate}
        onPause={deactivate}
      />
    )}
    <EditableAttribute
      disabled={!editing}
      title="YouTube slug"
      value={slug}
      onChange={onChange}
    />
  </div>
)

const Image = ({
  src,
  alt,
  photoCredit,
  callToAction,
  active,
  activate,
  deactivate,
  editing,
  onChange,
}) => {
  let imageProps = {
    style: { width: '100%', minHeight: '3em', display: 'block' },
    src: `${src}?w=640`,
    alt,
  }
  let imageComponent = callToAction ? (
    <img alt={alt} {...imageProps} />
  ) : (
    <ImageZoom
      isZoomed={active}
      defaultStyles={{ overlay: { backgroundColor: '#1D2934' }}}
      image={imageProps}
      zoomImage={{ src }}
      onZoom={activate}
      onUnzoom={deactivate}
    />
  )

  return (
    <div>
      {src &&
        (editing || photoCredit) && (
          <PhotoCredit>
            <EditableText
              multiline
              value={photoCredit}
              disabled={!editing}
              placeholder={editing ? 'Photo credit' : ''}
              onChange={onChange('photoCredit')}
            />
          </PhotoCredit>
        )}
      {src && imageComponent}
      <EditableAttribute
        disabled={!editing}
        title="image url"
        value={src}
        onChange={onChange('imageUrl')}
      />
      {src && (
        <EditableAttribute
          disabled={!editing}
          title="alt text"
          value={alt}
          onChange={onChange('altText')}
        />
      )}
    </div>
  )
}

class AudioPlayer extends React.Component<*> {
  audioPlayer: ?HTMLAudioElement

  componentDidUpdate (prevProps) {
    if (!prevProps.active && this.props.active) {
      this.audioPlayer && this.audioPlayer.play()
    }
  }

  render () {
    let { src, editing, onChange } = this.props
    return (
      <div>
        {src && (
          <audio
            controls
            ref={c => {
              this.audioPlayer = c
            }}
            style={{
              width: '100%',
              borderRadius: 2,
              borderBottom: `4px solid ${lightGreen}`,
            }}
            src={src}
          />
        )}
        <EditableAttribute
          disabled={!editing}
          title="audio url"
          value={src}
          onChange={onChange}
        />
      </div>
    )
  }
}

const Background = ({ visible, children }) => (
  <div style={visible ? backgroundedStyle : {}}>{children}</div>
)

const CallToAction = ({ contents, websiteUrl, editing, onChange }) => (
  <div>
    <EditableAttribute
      disabled={!editing}
      title="website"
      value={websiteUrl}
      onChange={onChange('websiteUrl')}
    />
    {(contents || editing) && (
    <div style={{ margin: '0.25em 0 0 0', lineHeight: 1 }}>
      <EditableText
        multiline
        disabled={!editing}
        placeholder="Add call to action ›"
        value={contents}
        onChange={onChange('callToAction')}
      />
    </div>
      )}
  </div>
)

const Caption = ({ contents, selected, editing, onChange }) =>
  contents || editing ? (
    <div style={{ margin: '0.25em 0 0 0' }}>
      <figcaption
        className={selected ? 'edge--highlighted' : ''}
        style={{ fontSize: '110%', lineHeight: 1.1 }}
      >
        <EditableText
          multiline
          placeholder="Add caption..."
          value={contents}
          disabled={!editing}
          onChange={onChange}
        />
      </figcaption>
    </div>
  ) : null

const PullQuote = ({ contents, selected, editing, onChange }) =>
  contents || editing ? (
    <blockquote
      className={selected ? 'edge--highlighted' : ''}
      style={{
        fontSize: '140%',
        lineHeight: 1.3,
        margin: '0 0 0.5em 0',
        padding: '0',
      }}
    >
      <EditableText
        multiline
        placeholder="“Add quotation...”"
        value={contents}
        disabled={!editing}
        onChange={onChange}
      />
    </blockquote>
  ) : null

const Attribution = ({ name, editing, onChange }) =>
  name || editing ? (
    <cite
      style={{
        textAlign: 'right',
        display: 'block',
        fontStyle: 'normal',
        margin: '0.5em 0 0.25em 0',
        lineHeight: 1,
      }}
    >
      <EditableText
        multiline
        placeholder="— Attribution"
        value={name}
        disabled={!editing}
        onChange={onChange}
      />
    </cite>
  ) : null

const backgroundedStyle = {
  backgroundColor: '#49647D',
  padding: '0.5em 1em',
  borderRadius: '2px 2px 0 0',
}

const lightGreen = '#6ACB72'

const PhotoCredit = styled.cite`
  text-transform: uppercase;
  letter-spacing: 0.25px;
  color: rgba(235, 234, 228, 0.5);
  font: normal 500 10px 'tenso';
  display: block;
  min-width: 100%;
  text-align: right;
  margin: 2px -3px;
`
