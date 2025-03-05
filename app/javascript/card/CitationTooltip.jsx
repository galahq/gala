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
import { ensureHttp } from 'shared/functions'

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
      key &&
        !(
          document.documentElement &&
          document.documentElement.classList.contains('bp3-focus-disabled')
        ) &&
        (window.location.hash = `citation-marker-${key}`)
    },
  }
}

class CitationTooltip extends React.Component<*> {
  componentDidMount () {
    const { key } = this.props.openedCitation
    key &&
      !(
        document.documentElement &&
        document.documentElement.classList.contains('bp3-focus-disabled')
      ) &&
      (window.location.hash = `citation-${key}`)
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
      transform: 'translateY(calc((-100% + 3em)))',
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
            <Grid>
              <label htmlFor={`citation-${openedCitation.key}[text]`}>
                <FormattedMessage id="cards.edit.citationText" />
              </label>
              <Field
                id={`citation-${openedCitation.key}[text]`}
                value={contents}
                onChange={updateCitation('contents')}
              />
              <label htmlFor={`citation-${openedCitation.key}[url]`}>
                <FormattedMessage id="cards.edit.citationUrl" />
              </label>
              <Field
                id={`citation-${openedCitation.key}[url]`}
                value={href}
                onChange={updateCitation('href')}
              />
            </Grid>
            <Button onClick={onCloseCitation}>
              <FormattedMessage id="helpers.save" />
            </Button>
          </form>
        ) : (
          <span tabIndex="0" id={`citation-${openedCitation.key}`}>
            {contents}{' '}
            {href && (
              <a
                href={ensureHttp(href)}
                target="_blank"
                rel="noopener noreferrer"
                tabIndex="0"
              >
                <span style={{ whiteSpace: 'nowrap' }}>
                  <FormattedMessage id="catalog.learnMore" /> ›
                </span>
              </a>
            )}
            <LabelForScreenReaders>
              <a
                href={`#citation-marker-${openedCitation.key}`}
                tabIndex="0"
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

// $FlowFixMe
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CitationTooltip)

const Tooltip = styled.cite.attrs({ 'data-test-id': 'CitationTooltip' })`
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

const Grid = styled.div`
  align-items: center;
  display: grid;
  grid-gap: 0 0.5em;
  grid-template-columns: 4em auto;

  label {
    justify-self: flex-end;
  }

  input + label {
    /* for non grid browsers */
    display: block;
  }
`

const Field = styled.input.attrs({ className: 'bp3-input' })`
  margin-top: 0.25em;
`

const Button = styled.button.attrs({
  className: 'bp3-button',
  type: 'button',
})`
  margin-top: 0.25em;
  margin-bottom: 0.25em;
`
