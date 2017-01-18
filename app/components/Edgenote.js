import React from 'react'  // eslint-disable-line no-unused-vars
import { connect } from 'react-redux'
import ImageZoom from 'react-medium-image-zoom'
import YoutubePlayer from 'react-youtube-player'
import {EditableText} from '@blueprintjs/core'

class EdgenoteFigure extends React.Component {
  componentDidUpdate(prevProps) {
    if (!prevProps.active && this.props.active) {
      if (this.props.contents.callToAction && this.props.contents.websiteUrl) {
        window.open(this.props.contents.websiteUrl, '_blank')
        setTimeout(() => {this.props.deactivate()}, 300)
      }
    }
  }

  render() {
    let {contents, selected, active, activate, deactivate, onMouseOver, onMouseOut} = this.props
    let {slug, caption, youtubeSlug, pullQuote, imageUrl, callToAction,
      websiteUrl, audioUrl, attribution} = contents

    let ConditionalLink = callToAction ? "a" : "div"
    let conditionalHoverCallbacks = callToAction
    ? { onMouseEnter: onMouseOver,
      onMouseLeave: onMouseOut }
    : {}

    let activationProps = {active: active, activate: activate, deactivate: deactivate}

    return <figure className="edge" id={slug} {...conditionalHoverCallbacks}>
      <ConditionalLink target="_blank" href={websiteUrl}>

        <YouTube slug={youtubeSlug} {...activationProps} />

        { !!youtubeSlug || !!pullQuote ||
          <Image src={imageUrl} {...activationProps} /> }

          <Background visible={!!audioUrl}>
            { !!youtubeSlug || <PullQuote contents={pullQuote} selected={selected} /> }
            <Attribution name={attribution} />
          </Background>
          <AudioPlayer src={audioUrl} {...activationProps} />

          <Caption contents={caption} selected={selected} />
          <CallToAction contents={callToAction} />

        </ConditionalLink>
      </figure>
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    selected: ownProps.slug === state.ui.highlightedEdgenote,
    active: ownProps.slug === state.ui.activeEdgenote,
    contents: state.edgenotesBySlug[ownProps.slug]
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    activate: () => { dispatch({type: 'ACTIVATE_EDGENOTE', edgenoteSlug: ownProps.slug}) },
    deactivate: () => { dispatch({type: 'ACTIVATE_EDGENOTE', edgenoteSlug: null}) },
    onMouseOver: () => { dispatch({type: 'HIGHLIGHT_EDGENOTE', edgenoteSlug: ownProps.slug}) },
    onMouseOut: () => { dispatch({type: 'HIGHLIGHT_EDGENOTE', edgenoteSlug: null}) }
  }
}

export const Edgenote = connect(mapStateToProps, mapDispatchToProps)(EdgenoteFigure)



const YouTube = ({slug, active, activate, deactivate}) => slug
  ? <YoutubePlayer
    videoId={slug}
    playbackState={active ? 'playing' : 'paused'}
    onPlay={activate}
    onPause={deactivate}
    configuration={{
      theme: 'light'
    }}
  />
  : null

const Image = ({src, active}) => src
  ? <ImageZoom
      isZoomed={active}
      shouldRespectMaxDimension
      defaultStyles={{overlay: {backgroundColor: '#1D2934'}}}
      image={{style: {width: '100%', minHeight: '3em', display: 'block'}, src: src}} />
  : null

class AudioPlayer extends React.Component {
  componentDidUpdate(prevProps) {
    if (!prevProps.active && this.props.active) {
      this.audioPlayer && this.audioPlayer.play()
    }
  }

  render() {
    let {src} = this.props
    return src
    ? <audio
      ref={c => {this.audioPlayer = c}}
      style={{width: '100%', borderRadius: 2, borderBottom: `4px solid ${lightGreen}`}}
      controls
      src={src} />
    : null
  }
}

const Background = ({visible, children}) => <div style={visible ? backgroundedStyle : {}}>{children}</div>

const CallToAction = ({contents}) => contents
  ? <p style={{margin: "0.25em 0 0 0"}}>{contents}&nbsp;›</p>
  : null


const Caption = ({contents, selected}) => contents
  ? <div style={{margin: '0.25em 0 0 0'}}><figcaption
    style={{
      fontSize: "110%",
      lineHeight: 1.1,
      display: "inline",
      ...highlightableStyle,
      ...(selected && highlightedStyle)
    }}>
      <EditableText multiline placeholder="Edit caption..." value={contents} />
    </figcaption></div>
  : null

const PullQuote = ({contents, selected}) => contents
  ? <blockquote
    style={{
      fontSize: '140%',
      lineHeight: 1.3,
      margin: '0 0 0.5em 0',
      padding: '0',
      display: "inline",
      ...highlightableStyle,
      ...(selected && highlightedStyle)
    }}>
    <EditableText multiline placeholder="“Edit quotation...”" value={`“${contents}…”`} />
      </blockquote>
  : null

const Attribution = ({name}) => name
  ? <cite style={{textAlign: 'right', display: 'block', fontStyle: 'normal', margin: '0.5em 0 0.25em 0'}}>
    <EditableText multiline placeholder="Add attribution..." value={`– ${name}`} />
    </cite>
  : null



const backgroundedStyle = {
  backgroundColor: "#49647D",
  padding: '0.5em 1em',
  borderRadius: '2px 2px 0 0'
}

const lightGreen = "#6ACB72"

const highlightableStyle = {
  transition: `background .15s cubic-bezier(.33, .66, .66, 1),
    box-shadow .15s cubic-bezier(.33, .66, .66, 1),
    color .15s cubic-bezier(.33, .66, .66, 1)`
}
const highlightedStyle = {
  backgroundColor: lightGreen,
  color: "#000",
  boxShadow: `
    ${lightGreen} -0.15em 0      0,
    ${lightGreen} -0.15em 0.05em 0,
    ${lightGreen} 0.2em   0.05em 0,
    ${lightGreen} 0.2em   0      0`

}
