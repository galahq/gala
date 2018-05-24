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

import { FormattedMessage } from 'react-intl'
import { LabelForScreenReaders } from 'utility/A11y'
import { acceptKeyboardClick } from 'shared/keyboard'
import Lock from 'utility/Lock'
import Statistics from 'utility/Statistics'
import Tracker from 'utility/Tracker'
import EdgenoteEditor from 'edgenotes/editor'
import Expansion from './expansion'
import withExpansion from './expansion/withExpansion'
import Image from './Image'
import PullQuote from './PullQuote'

import {
  highlightEdgenote,
  activateEdgenote,
  updateEdgenote,
} from 'redux/actions'

import type { State, Edgenote } from 'redux/state'
import type { Dispatch } from 'redux/actions'
import type { ILinkExpansion } from './expansion/LinkExpansion'

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
  contents: ?Edgenote,
  editing: boolean,
  embedded?: boolean,
  expansion: ILinkExpansion,
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
      expansion,
    } = this.props
    if (contents == null) return null

    const { slug, caption, pullQuote } = contents

    const isALink = !editing && expansion.actsAsLink()

    const ConditionalLink = isALink ? LinkBody : Body
    const conditionalHoverCallbacks = isALink
      ? {
        onMouseEnter: onMouseOver,
        onMouseLeave: onMouseOut,
      }
      : {}

    return (
      <Container
        data-test-id="edgenote"
        id={slug}
        {...conditionalHoverCallbacks}
      >
        <Lock type="Edgenote" param={slug}>
          {({ locked, onBeginEditing, onFinishEditing }) => (
            <React.Fragment>
              {editing && (
                <EdgenoteEditor
                  contents={contents}
                  locked={locked}
                  slug={slug}
                  onChange={onChange}
                  onClose={onFinishEditing}
                  onOpen={onBeginEditing}
                />
              )}

              {embedded || <Statistics inline uri={`edgenotes/${slug}`} />}

              <ConditionalLink
                tabIndex={isALink ? '0' : ''}
                id={`edgenote-${slug}`}
                role={isALink ? 'button' : undefined}
                onClick={!isALink || active ? () => {} : activate}
                onKeyPress={acceptKeyboardClick}
              >
                {this.renderQuotationSection() || this.renderImageSection()}

                <Expansion contents={contents} expansion={expansion} />

                <Caption
                  contents={caption}
                  {...this._reduxProps()}
                  {...(pullQuote ? { selected: false } : {})} // overrides reduxProps
                />
                {this.renderCallToAction()}
              </ConditionalLink>
              <LabelForScreenReaders>
                <a href={`#edgenote-highlight-${slug}`}>
                  <FormattedMessage id="edgenotes.edgenote.returnToNarrative" />
                </a>
              </LabelForScreenReaders>

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
            </React.Fragment>
          )}
        </Lock>
      </Container>
    )
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
    const { contents, expansion } = this.props

    if (contents == null || expansion.hasEmbed()) return null
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
    const { contents, expansion } = this.props

    if (
      contents == null ||
      (!expansion.actsAsLink() && contents.callToAction == null)
    ) {
      return null
    }
    const { audioUrl, callToAction, pullQuote, imageUrl, caption } = contents

    if (audioUrl) return null

    return (
      <CallToAction
        linkDomain={expansion.linkDomain()}
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
        {!contents || (contents && !contents.trim().endsWith('›')) ? ' ›' : ''}
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
