/**
 * @providesModule CitationTooltip
 * @flow
 */

import React from 'react'
import { connect } from 'react-redux'
import { EditorState } from 'draft-js'
import { FormattedMessage } from 'react-intl'
import styled from 'styled-components'
import { LabelForScreenReaders } from 'utility/A11y'

import { updateCardContents, openCitation } from 'redux/actions'

import type { State, Citation } from 'redux/state'
import type { Dispatch } from 'redux/actions'

const TOOLTIP_WIDTH = 294

type OwnProps = {
  cardId: string,
  openedCitation: Citation,
}

function mapStateToProps (state: State, ownProps: OwnProps) {
  const editorState =
    state.cardsById[ownProps.cardId].editorState || EditorState.createEmpty()
  const key = ownProps.openedCitation.key
  const { href, contents } =
    key != null
      ? (editorState
        .getCurrentContent()
        .getEntity(key)
        .getData(): { href: string, contents: string })
      : { href: '', contents: '' }

  return { editorState, href, contents }
}

function mapDispatchToProps (dispatch: Dispatch, ownProps: OwnProps) {
  const { key } = ownProps.openedCitation
  return {
    onChange: (eS: EditorState) =>
      dispatch(updateCardContents(ownProps.cardId, eS)),
    onCloseCitation: () => {
      dispatch(openCitation(null))
      key && (window.location.hash = `citation-marker-${key}`)
    },
  }
}

class CitationTooltip extends React.Component<*> {
  componentDidMount () {
    const { key } = this.props.openedCitation
    key && (window.location.hash = `citation-${key}`)
  }
  render () {
    const {
      openedCitation,
      editable,
      editorState,
      href,
      contents,
      onChange,
      onCloseCitation,
      cardWidth,
    } = this.props
    let label = openedCitation.labelRef
    let top = label.offsetTop

    let horizontalCenter = label.offsetLeft - TOOLTIP_WIDTH / 2
    let left = Math.min(
      cardWidth - TOOLTIP_WIDTH - 21,
      Math.max(horizontalCenter, 7)
    )

    let positionalStyles = {
      position: 'absolute',
      left,
      top,
      transform: 'translateY(calc(-100% + 3px)',
    }

    let closeCitation = editable ? null : close

    let updateCitation = attr => e => {
      const contentState = editorState.getCurrentContent()
      /* let newContentState = */ contentState.mergeEntityData(
        openedCitation.key,
        { [attr]: e.currentTarget.value }
      )
      // When eventually the Entity API is rejiggered so entities are inside of
      // ContentState, then we’ll have to push newcontentState. For now,
      // mergeEntityData is mutating editorState, so we just dispatch the object
      // itself.
      //
      // onChange(EditorState.push(editorState, newContentState, 'apply-entity'))
      onChange(editorState)
    }

    return (
      <Tooltip style={positionalStyles} onClick={closeCitation}>
        {editable ? (
          <form>
            <Field
              value={contents}
              placeholder="Citation text"
              onChange={updateCitation('contents')}
            />
            <Field
              value={href}
              placeholder="Resource URL"
              onChange={updateCitation('href')}
            />
            <Button onClick={onCloseCitation}>Close</Button>
          </form>
        ) : (
          <span tabIndex="0" id={`citation-${openedCitation.key}`}>
            {contents}{' '}
            {href && (
              <a href={href} target="_blank" rel="noopener noreferrer">
                <span style={{ whiteSpace: 'nowrap' }}>
                  <FormattedMessage id="catalog.learnMore" /> ›
                </span>
              </a>
            )}
            <LabelForScreenReaders>
              <a
                href={`#citation-marker-${openedCitation.key}`}
                onClick={onCloseCitation}
              >
                <FormattedMessage id="edgenotes.edgenote.returnToNarrative" />
              </a>
            </LabelForScreenReaders>
          </span>
        )}
      </Tooltip>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CitationTooltip)

const Tooltip = styled.cite`
  background: #6acb72;
  border-radius: 2px;
  box-shadow: 0 0 0 1px rgba(16, 22, 26, 0.1), 0 2px 4px rgba(16, 22, 26, 0.2),
    0 8px 24px rgba(16, 22, 26, 0.2);
  color: black;
  display: block;
  font: 14px tenso;
  width: ${TOOLTIP_WIDTH}px;
  padding: 0.25em 0.5em;
  z-index: 10;
`

const Field = styled.input.attrs({ className: 'pt-input pt-fill' })`
  margin-top: 0.25em;
`

const Button = styled.button.attrs({
  className: 'pt-button',
  type: 'button',
})`
  margin-top: 0.25em;
  margin-bottom: 0.25em;
`
