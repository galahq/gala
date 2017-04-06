import React from 'react'  // eslint-disable-line no-unused-vars
import { connect } from 'react-redux'
import ImageZoom from 'react-medium-image-zoom'
import YoutubePlayer from 'react-youtube-player'
import { EditableText } from '@blueprintjs/core'

import Tracker from 'utility/Tracker'
import EditableAttribute from 'EditableAttribute'

import {
  highlightEdgenote,
  activateEdgenote,
  updateEdgenote,
} from 'redux/actions'

const mapStateToProps = (state, {slug}) => {
  return {
    editing: state.edit.inProgress,
    selected: slug === state.ui.highlightedEdgenote,
    active: slug === state.ui.activeEdgenote,
    contents: state.edgenotesBySlug[slug],
  }
}

const mapDispatchToProps = (dispatch, {slug}) => {
  return {
    activate: () => dispatch(activateEdgenote(slug)),
    deactivate: () => dispatch(activateEdgenote(null)),
    onMouseOver: () => dispatch(highlightEdgenote(slug)),
    onMouseOut: () => dispatch(highlightEdgenote(null)),
    onChange: attr => value => dispatch(updateEdgenote(
      slug,
      {[attr]: value},
    )),
  }
}

class EdgenoteFigure extends React.Component {
  componentDidUpdate (prevProps) {
    if (!prevProps.active && this.props.active) {
      if (this.props.contents.callToAction && this.props.contents.websiteUrl) {
        window.open(this.props.contents.websiteUrl, '_blank')
        setTimeout(() => { this.props.deactivate() }, 300)
      }
    }
  }

  render () {
    const {
      contents, selected, active, activate, deactivate, onMouseOver,
      onMouseOut, editing, onChange,
    } = this.props
    if (!contents) return null

    const {
      slug, caption, youtubeSlug, pullQuote, imageUrl, callToAction, websiteUrl,
      audioUrl, attribution,
    } = contents

    const isALink = !youtubeSlug && !audioUrl && callToAction && !editing

    const ConditionalLink = isALink ? 'a' : 'div'
    const conditionalHoverCallbacks = isALink
    ? { onMouseEnter: onMouseOver,
      onMouseLeave: onMouseOut }
    : {}

    const reduxProps = { active, activate, deactivate, editing, selected }

    const Or = editing && !youtubeSlug && !pullQuote && !audioUrl && !imageUrl
      ? () => <label>or</label>
      : () => null

    return <figure className="edge" id={slug} {...conditionalHoverCallbacks}>
      <ConditionalLink target="_blank" href={websiteUrl}>

        { !!pullQuote || !!imageUrl || !!audioUrl ||
          <YouTube
            slug={youtubeSlug}
            onChange={onChange('youtubeSlug')}
            {...reduxProps}
          />
        }

        <Or />

        {!!youtubeSlug || !!imageUrl ||
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
        }
        { !!youtubeSlug || !!imageUrl ||
          <AudioPlayer
            src={audioUrl}
            {...reduxProps}
            onChange={onChange('audioUrl')}
          />
        }

        <Or />

        { !!youtubeSlug || !!pullQuote || !!audioUrl ||
          <Image
            src={imageUrl}
            callToAction={callToAction}
            {...reduxProps}
            onChange={onChange('imageUrl')}
          />
        }

        <Caption
          contents={caption}
          {...reduxProps}
          {...(pullQuote ? {selected: false} : {})}
          onChange={onChange('caption')}
        />
        { !!youtubeSlug || !!audioUrl ||
          <CallToAction
            websiteUrl={websiteUrl}
            contents={callToAction}
            {...reduxProps}
            onChange={onChange}
          />
        }

      </ConditionalLink>

      <Tracker
        timerState={active ? 'RUNNING' : 'STOPPED'}
        targetKey={`edgenotes/${slug}`}
        targetParameters={{
          name: 'visit_edgenote',
          edgenoteSlug: slug,
        }}
      />
    </figure>
  }
}

export const Edgenote = connect(
  mapStateToProps,
  mapDispatchToProps,
)(EdgenoteFigure)

const YouTube = ({slug, active, activate, deactivate, editing,
                 onChange}) => <div>
                   { slug && <YoutubePlayer
                     videoId={slug}
                     playbackState={active ? 'playing' : 'paused'}
                     configuration={{
                       theme: 'light',
                     }}
                     onPlay={activate}
                     onPause={deactivate}
                   /> }
                   <EditableAttribute
                     disabled={!editing}
                     title="YouTube slug"
                     value={slug}
                     onChange={onChange}
                   />
                 </div>

const Image = ({src, callToAction, active, activate, deactivate, editing,
               onChange}) => {
  let imageProps = {
    style: {width: '100%', minHeight: '3em', display: 'block'},
    src: `${src}?w=640`,
  }
  let imageComponent = callToAction ? <img {...imageProps} /> : <ImageZoom
    isZoomed={active}
    defaultStyles={{overlay: {backgroundColor: '#1D2934'}}}
    image={imageProps}
    zoomImage={{src}}
    onZoom={activate}
    onUnzoom={deactivate}
  />

  return <div>
    { src && imageComponent}
    <EditableAttribute
      disabled={!editing}
      title="image url"
      value={src}
      onChange={onChange}
    />
  </div>
}

class AudioPlayer extends React.Component {
  componentDidUpdate (prevProps) {
    if (!prevProps.active && this.props.active) {
      this.audioPlayer && this.audioPlayer.play()
    }
  }

  render () {
    let {src, editing, onChange} = this.props
    return <div>
      { src && <audio
        controls
        ref={c => { this.audioPlayer = c }}
        style={{width: '100%', borderRadius: 2, borderBottom: `4px solid ${lightGreen}`}}
        src={src} />}
      <EditableAttribute
        disabled={!editing}
        title="audio url"
        value={src}
        onChange={onChange}
      />
    </div>
  }
}

const Background = ({visible, children}) =>
  <div style={visible ? backgroundedStyle : {}}>{children}</div>

const CallToAction = ({contents, websiteUrl, editing, onChange}) => <div>
  <EditableAttribute
    disabled={!editing}
    title="website"
    value={websiteUrl}
    onChange={onChange('websiteUrl')}
  />
  {(contents || editing) && <p style={{margin: '0.25em 0 0 0', lineHeight: 1}}>
    <EditableText
      multiline
      disabled={!editing}
      placeholder="Add call to action ›"
      value={contents}
      onChange={onChange('callToAction')}
    />
  </p> }
</div>

const Caption = ({contents, selected, editing, onChange}) => contents || editing
  ? <div style={{margin: '0.25em 0 0 0'}}>
    <figcaption
      className={selected && 'edge--highlighted'}
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
  : null

const PullQuote = ({contents, selected, editing, onChange}) =>
  contents || editing ? <blockquote
    className={selected && 'edge--highlighted'}
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
  : null

const Attribution = ({name, editing, onChange}) => name || editing ? <cite
  style={{
    textAlign: 'right',
    display: 'block',
    fontStyle: 'normal',
    margin: '0.5em 0 0.25em 0',
    lineHeight: 1,
  }}>
  <EditableText
    multiline
    placeholder="— Attribution"
    value={name}
    disabled={!editing}
    onChange={onChange}
  />
</cite>
: null

const backgroundedStyle = {
  backgroundColor: '#49647D',
  padding: '0.5em 1em',
  borderRadius: '2px 2px 0 0',
}

const lightGreen = '#6ACB72'
