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
import { connect } from 'react-redux'
import { EditableText } from '@blueprintjs/core'

import YouTube from './YouTube'
import Image from './Image'
import PullQuote from './PullQuote'
import Statistics from 'utility/Statistics'
import Tracker from 'utility/Tracker'
import EditableAttribute from 'utility/EditableAttribute'

import {
  highlightEdgenote,
  activateEdgenote,
  updateEdgenote,
} from 'redux/actions'

import type { State, Edgenote } from 'redux/state'
import type { Dispatch } from 'redux/actions'

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
    onChange: (attr: string) => (value: string) =>
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

export type ReduxProps = {|
  activate: () => Promise<any>,
  active: boolean,
  deactivate: () => Promise<any>,
  editing: boolean,
  selected: boolean,
|}

class EdgenoteFigure extends React.Component<{
  ...ReduxProps,
  contents: ?Edgenote,
  onMouseOver: () => Promise<any>,
  onMouseOut: () => Promise<any>,
  onChange: string => string => Promise<any>,
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
      active,
      activate,
      onMouseOver,
      onMouseOut,
      editing,
      onChange,
    } = this.props
    if (contents == null) return null

    const {
      slug,
      caption,
      youtubeSlug,
      pullQuote,
      imageUrl,
      callToAction,
      audioUrl,
    } = contents

    const isALink = !youtubeSlug && !audioUrl && !!callToAction && !editing

    const ConditionalLink = isALink ? 'a' : 'div'
    const conditionalHoverCallbacks = isALink
      ? {
        onMouseEnter: onMouseOver,
        onMouseLeave: onMouseOut,
      }
      : {}

    const Or =
      editing && !youtubeSlug && !pullQuote && !audioUrl && !imageUrl
        ? () => <span>or</span>
        : () => null

    return (
      <figure className="edge" id={slug} {...conditionalHoverCallbacks}>
        <Statistics inline uri={`edgenotes/${slug}`} />
        <ConditionalLink
          tabIndex={isALink ? '0' : false}
          onClick={active ? () => {} : activate}
        >
          {this.renderVideoSection()}
          <Or />
          {this.renderQuotationSection()}
          <Or />
          {this.renderImageSection()}

          <Caption
            contents={caption}
            {...this._reduxProps()}
            {...(pullQuote ? { selected: false } : {})} // overrides reduxProps
            onChange={onChange('caption')}
          />
          {this.renderCallToAction()}
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

  renderVideoSection () {
    const { contents, onChange } = this.props

    if (contents == null) return null
    const { pullQuote, imageUrl, audioUrl, youtubeSlug } = contents

    if (!!pullQuote || !!imageUrl || !!audioUrl) return null

    return (
      <YouTube
        slug={youtubeSlug}
        onChange={onChange('youtubeSlug')}
        {...this._reduxProps()}
      />
    )
  }

  renderQuotationSection () {
    const { contents, onChange } = this.props

    if (contents == null) return null
    const { pullQuote, imageUrl, audioUrl, youtubeSlug, attribution } = contents

    if (!!youtubeSlug || !!imageUrl) return null

    return (
      <PullQuote
        attribution={attribution}
        audioUrl={audioUrl}
        contents={pullQuote}
        hasBackground={!!audioUrl}
        {...this._reduxProps()}
        onChangeProp={onChange}
      />
    )
  }

  renderImageSection () {
    const { contents, onChange } = this.props

    if (contents == null) return null
    const {
      pullQuote,
      imageUrl,
      audioUrl,
      youtubeSlug,
      altText,
      photoCredit,
      callToAction,
    } = contents

    if (!!youtubeSlug || !!pullQuote || !!audioUrl) return null

    return (
      <Image
        src={imageUrl}
        alt={altText}
        photoCredit={photoCredit}
        callToAction={callToAction}
        {...this._reduxProps()}
        onChange={onChange}
      />
    )
  }

  renderCallToAction () {
    const { contents, onChange } = this.props

    if (contents == null) return null
    const { audioUrl, youtubeSlug, callToAction, websiteUrl } = contents

    if (!!youtubeSlug || !!audioUrl) return null

    return (
      <CallToAction
        websiteUrl={websiteUrl}
        contents={callToAction}
        {...this._reduxProps()}
        onChange={onChange}
      />
    )
  }

  _reduxProps () {
    const { active, activate, deactivate, editing, selected } = this.props
    return { active, activate, deactivate, editing, selected }
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(
  EdgenoteFigure
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
