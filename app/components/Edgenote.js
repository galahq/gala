import React from 'react'  // eslint-disable-line no-unused-vars
import ImageZoom from 'react-medium-image-zoom'

export const Edgenote = ({contents}) => {
  let {caption, youtubeSlug, pullQuote, imageUrl, callToAction, websiteUrl} = contents

  let ConditionalLink = callToAction ? "a" : "div"

  return <figure className="edge">
    <ConditionalLink target="_blank" href={websiteUrl}>
      <YouTube slug={youtubeSlug} />
      { !!youtubeSlug || <PullQuote contents={pullQuote} /> }
      { !!youtubeSlug || !!pullQuote || <Image src={imageUrl} /> }
      <Caption contents={caption} />
      <CallToAction contents={callToAction} />
    </ConditionalLink>
  </figure>
}



const YouTube = ({slug}) => slug
  ? <iframe
      style={{width: '100%'}}
      src={`https://www.youtube.com/embed/${slug}` }
      frameBorder="0"
      allowFullScreen />
  : null

const PullQuote = ({contents}) => contents
  ? <blockquote
      style={{fontSize: '140%', lineHeight: 1.3, margin: '0 0 0.5em 0', padding: '0'}}
      children={`“${contents}”`} />
  : null

const Image = ({src}) => src
  ? <ImageZoom
      shouldRespectMaxDimension
      defaultStyles={{overlay: {backgroundColor: '#1D2934'}}}
      image={{style: {width: '100%', minHeight: '3em'}, src: src}} />
  : null

const Caption = ({contents}) => contents
  ? <figcaption style={{margin: '0.25em 0 0 0', fontSize: "110%", lineHeight: 1.1}}>{contents}</figcaption>
  : null

const CallToAction = ({contents}) => contents
  ? <p style={{margin: "0.25em 0 0 0"}}>{contents}&nbsp;›</p>
  : null

