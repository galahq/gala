/**
 * Renders a `v2` style Edgenote, an element of curated media which accompanies
 * a case narrative. On a large enough screen, it appears to the right of a
 * card---otherwise they are inserted after a card. Edgenote slugs are
 * referenced from the rawContent of cards, in the data of DraftEntities.
 *
 * `v2` Edgenotes have a clean design which looks less like a textbook than the
 * deprecated `v1` style. Those Edgenotes, which still appear in some cases, are
 * rendered by the `deprecated/OldEdgenote` component.
 *
 * If a video is specified by `youtubeSlug`, then quotation elements and image
 * elements will not be rendered.
 *
 * Otherwise, if a `pullQuote` is given, then image elements will not be
 * rendered. An audio snippet is treated as a specialization of a quotation: if
 * an `audioUrl` is given, the pull quote is expected to be a representative
 * exerpt of the audio.
 *
 * The caption is always rendered.
 *
 * A non-video Edgenote functions as a link if it has a `callToAction` *and* a
 * `websiteUrl`.
 *
 * @providesModule Edgenote
 * @flow
 */

import * as React from 'react'
import styled from 'styled-components'
import { connect } from 'react-redux'

import withExpansion from './withExpansion'
import YouTube from './YouTube'
import Image from './Image'
import PullQuote from './PullQuote'
import Statistics from 'utility/Statistics'
import Tracker from 'utility/Tracker'
import EdgenoteEditor from 'edgenotes/editor'

import {
  highlightEdgenote,
  activateEdgenote,
  updateEdgenote,
} from 'redux/actions'

import type { State, Edgenote } from 'redux/state'
import type { Dispatch } from 'redux/actions'
import type { ExpansionProps } from './withExpansion'

type OwnProps = { slug: string }
function mapStateToProps (state: State, { slug }: OwnProps) {
  return {
    editing: state.edit.inProgress,
    selected: slug === state.ui.highlightedEdgenote,
    active: slug === state.ui.activeEdgenote,
    contents: state.edgenotesBySlug[slug],
  }
}

function mapDispatchToProps (dispatch: Dispatch, { slug }: OwnProps) {
  return {
    activate: () => dispatch(activateEdgenote(slug)),
    deactivate: () => dispatch(activateEdgenote(null)),
    onMouseOver: () => dispatch(highlightEdgenote(slug)),
    onMouseOut: () => dispatch(highlightEdgenote(null)),
    onChange: (data: $Shape<Edgenote>) => dispatch(updateEdgenote(slug, data)),
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

export type ReduxProps = {|
  activate: () => any,
  active: boolean,
  deactivate: () => any,
  selected: boolean,
|}

type Props = {
  ...ReduxProps,
  ...ExpansionProps,
  contents: ?Edgenote,
  editing: boolean,
  embedded?: boolean,
  onMouseOver: () => any,
  onMouseOut: () => any,
  onChange: ($Shape<Edgenote>) => any,
}

class BaseEdgenoteFigure extends React.Component<Props> {
  static defaultProps = {
    activate: () => {},
    active: false,
    deactivate: () => {},
    editing: false,
    selected: false,
    onMouseOver: () => {},
    onMouseOut: () => {},
    onChange: () => {},
  }

  componentDidUpdate (prevProps: Props) {
    if (!prevProps.active && this.props.active) {
      const { contents } = this.props
      if (contents && contents.websiteUrl) {
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
      active,
      activate,
      onChange,
      onMouseOver,
      onMouseOut,
      editing,
      embedded,
      actsAsLink,
    } = this.props
    if (contents == null) return null

    const { slug, caption, pullQuote } = contents

    const isALink = !editing && actsAsLink

    const ConditionalLink = isALink ? LinkBody : Body
    const conditionalHoverCallbacks = isALink
      ? {
        onMouseEnter: onMouseOver,
        onMouseLeave: onMouseOut,
      }
      : {}

    return (
      <Container id={slug} {...conditionalHoverCallbacks}>
        {editing && (
          <EdgenoteEditor contents={contents} slug={slug} onChange={onChange} />
        )}

        {embedded || <Statistics inline uri={`edgenotes/${slug}`} />}
        <ConditionalLink
          tabIndex={isALink ? '0' : ''}
          onClick={!isALink || active ? () => {} : activate}
        >
          {this.renderVideoSection() ||
            this.renderQuotationSection() ||
            this.renderImageSection()}

          {this.props.expansion}

          <Caption
            contents={caption}
            {...this._reduxProps()}
            {...(pullQuote ? { selected: false } : {})} // overrides reduxProps
          />
          {this.renderCallToAction()}
        </ConditionalLink>

        {editing || (
          <Tracker
            timerState={active ? 'RUNNING' : 'STOPPED'}
            targetKey={`edgenotes/${slug}`}
            targetParameters={{
              name: 'visit_edgenote',
              edgenoteSlug: slug,
            }}
            instantaneous={isALink}
          />
        )}
      </Container>
    )
  }

  renderVideoSection () {
    const { contents } = this.props

    if (contents == null) return null
    const { youtubeSlug } = contents

    if (!youtubeSlug) return null

    return <YouTube slug={youtubeSlug} {...this._reduxProps()} />
  }

  renderQuotationSection () {
    const { contents } = this.props

    if (contents == null) return null
    const { pullQuote, audioUrl, attribution } = contents

    if (!audioUrl && !pullQuote && !attribution) return null

    return (
      <PullQuote
        attribution={attribution}
        audioUrl={audioUrl}
        contents={pullQuote}
        hasBackground={!!audioUrl}
        {...this._reduxProps()}
      />
    )
  }

  renderImageSection () {
    const { contents } = this.props

    if (contents == null) return null
    const {
      imageUrl,
      imageThumbnailUrl,
      altText,
      photoCredit,
      callToAction,
    } = contents

    if (!imageUrl) return null

    return (
      <Image
        src={imageUrl}
        thumbnailSrc={imageThumbnailUrl}
        alt={altText}
        photoCredit={photoCredit}
        callToAction={callToAction}
        {...this._reduxProps()}
      />
    )
  }

  renderCallToAction () {
    const { actsAsLink, contents, linkDomain } = this.props

    if (!actsAsLink || contents == null) return null
    const {
      audioUrl,
      youtubeSlug,
      callToAction,
      pullQuote,
      imageUrl,
      caption,
    } = contents

    if (!!youtubeSlug || !!audioUrl) return null

    return (
      <CallToAction
        linkDomain={linkDomain}
        contents={callToAction}
        canHighlight={!pullQuote && !imageUrl && !caption}
        {...this._reduxProps()}
      />
    )
  }

  _reduxProps () {
    const { active, activate, deactivate, selected } = this.props
    return { active, activate, deactivate, selected }
  }
}

export const EdgenoteFigure = BaseEdgenoteFigure

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(
  withExpansion(EdgenoteFigure)
)

const Container = styled.figure.attrs({ className: 'edge' })`
  position: relative;
`

const Body = styled.div`
  &:empty {
    background-color: #4e6881aa;
    border-radius: 2px;
    height: 8em;
    width: 100%;
  }
`

const LinkBody = Body.withComponent('a')

const CallToAction = ({ contents, linkDomain, canHighlight, selected }) =>
  (contents || linkDomain) && (
    <div>
      <div
        className={canHighlight && selected ? 'edge--highlighted' : ''}
        style={{ display: 'inline', margin: '0.25em 0 0 0', lineHeight: 1 }}
      >
        {contents || linkDomain}
        {!contents || (contents && !contents.endsWith('›')) ? ' ›' : ''}
      </div>
    </div>
  )

const Caption = ({ contents, selected }) =>
  contents && (
    <div style={{ margin: '0.25em 0 0 0' }}>
      <figcaption
        className={selected ? 'edge--highlighted' : ''}
        style={{ fontSize: '110%', lineHeight: 1.1, display: 'inline' }}
      >
        {contents}
      </figcaption>
    </div>
  )
