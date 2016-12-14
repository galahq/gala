import React from 'react'  // eslint-disable-line no-unused-vars
import ImageZoom from 'react-medium-image-zoom'

export const Edgenote = ({contents, selected}) => {
  let {slug, caption, youtubeSlug, pullQuote, imageUrl, callToAction, websiteUrl} = contents

  let ConditionalLink = callToAction ? "a" : "div"

  return <figure className="edge" id={slug}
           onMouseEnter={() => {window.handleEdgenoteHover(slug)}}
           onMouseLeave={() => {window.handleEdgenoteHover(null)}}>
    <ConditionalLink target="_blank" href={websiteUrl}>
      <YouTube slug={youtubeSlug} />
      { !!youtubeSlug || <PullQuote contents={pullQuote} selected={selected} /> }
      { !!youtubeSlug || !!pullQuote || <Image src={imageUrl} /> }
      <Caption contents={caption} selected={selected} />
      <CallToAction contents={callToAction} />
    </ConditionalLink>
  </figure>
}



const lightGreen = "#6ACB72"

const canHighlight = {
  transition: `background .15s cubic-bezier(.33, .66, .66, 1),
    box-shadow .15s cubic-bezier(.33, .66, .66, 1),
    color .15s cubic-bezier(.33, .66, .66, 1)`
}
const highlighted = {
  backgroundColor: lightGreen,
  color: "#000",
  boxShadow: `
    ${lightGreen} -0.15em 0      0,
    ${lightGreen} -0.15em 0.05em 0,
    ${lightGreen} 0.2em   0.05em 0,
    ${lightGreen} 0.2em   0      0`
}

const YouTube = ({slug}) => slug
  ? <iframe
      style={{width: '100%'}}
      src={`https://www.youtube.com/embed/${slug}` }
      frameBorder="0"
      allowFullScreen />
  : null

const PullQuote = ({contents, selected}) => contents
  ? <blockquote
    style={{
      fontSize: '140%',
      lineHeight: 1.3,
      margin: '0 0 0.5em 0',
      padding: '0',
      display: "inline",
      ...canHighlight,
      ...(selected && highlighted)
    }}
      children={`“${contents}”`} />
  : null

const Image = ({src}) => src
  ? <ImageZoom
      shouldRespectMaxDimension
      defaultStyles={{overlay: {backgroundColor: '#1D2934'}}}
      image={{style: {width: '100%', minHeight: '3em'}, src: src}} />
  : null

const Caption = ({contents, selected}) => contents
  ? <figcaption
    style={{
      margin: '0.25em 0 0 0',
      fontSize: "110%",
      lineHeight: 1.1,
      display: "inline",
      ...canHighlight,
      ...(selected && highlighted)
    }}>{contents}</figcaption>
  : null

const CallToAction = ({contents}) => contents
  ? <p style={{margin: "0.25em 0 0 0"}}>{contents}&nbsp;›</p>
  : null

