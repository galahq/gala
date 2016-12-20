import React from 'react'  // eslint-disable-line no-unused-vars
import { connect } from 'react-redux'
import ImageZoom from 'react-medium-image-zoom'

const EdgenoteFigure = ({contents, selected}) => {
  let {slug, caption, youtubeSlug, pullQuote, imageUrl, callToAction,
    websiteUrl, audioUrl, attribution} = contents

  let ConditionalLink = callToAction ? "a" : "div"
  let conditionalHoverCallbacks = callToAction
    ? { onMouseEnter: () => {window.handleEdgenoteHover(slug)},
        onMouseLeave: () => {window.handleEdgenoteHover(null)} }
    : {}

  return <figure className="edge" id={slug} {...conditionalHoverCallbacks}>
    <ConditionalLink target="_blank" href={websiteUrl}>
      <YouTube slug={youtubeSlug} />
      { !!youtubeSlug || !!pullQuote || <Image src={imageUrl} /> }

      <Background visible={!!audioUrl}>
        { !!youtubeSlug || <PullQuote contents={pullQuote} selected={selected} /> }
        <Attribution name={attribution} />
      </Background>
      <AudioPlayer src={audioUrl} />

      <Caption contents={caption} selected={selected} />
      <CallToAction contents={callToAction} />
    </ConditionalLink>
  </figure>
}

const Image = ({src}) => src
  ? <ImageZoom
      shouldRespectMaxDimension
      defaultStyles={{overlay: {backgroundColor: '#1D2934'}}}
      image={{style: {width: '100%', minHeight: '3em'}, src: src}} />
  : null

const YouTube = ({slug}) => slug
  ? <iframe
      style={{width: '100%'}}
      src={`https://www.youtube.com/embed/${slug}` }
      frameBorder="0"
      allowFullScreen />
  : null

const AudioPlayer = ({src}) => src
  ? <audio
    style={{width: '100%', borderRadius: 2, borderBottom: `4px solid ${lightGreen}`}}
    controls
    src={src} />
  : null

const Background = ({visible, children}) => <div style={visible ? backgroundedStyle : {}}>{children}</div>

const CallToAction = ({contents}) => contents
  ? <p style={{margin: "0.25em 0 0 0"}}>{contents}&nbsp;›</p>
  : null


const Caption = ({contents, selected}) => contents
  ? <figcaption
    style={{
      margin: '0.25em 0 0 0',
      fontSize: "110%",
      lineHeight: 1.1,
      display: "inline",
      ...highlightableStyle,
      ...(selected && highlightedStyle)
    }}>{contents}</figcaption>
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
    }}
      children={`“${contents}…”`} />
  : null

const Attribution = ({name}) => name
  ? <cite style={{textAlign: 'right', display: 'block', fontStyle: 'normal', margin: '0.5em 0 0.25em 0'}}>— {name}</cite>
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



const mapStateToProps = (state, ownProps) => {
  return {
    selected: ownProps.slug === state.ui.highlightedEdgenote,
    contents: state.edgenotesBySlug[ownProps.slug]
  }
}

export const Edgenote = connect(mapStateToProps)(EdgenoteFigure)
