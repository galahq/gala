/**
 * @providesModule NewCommentForm
 * @flow
 */

import * as React from 'react'
import styled, { css } from 'styled-components'
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'

import { Editor, EditorState } from 'draft-js'

import Identicon from 'shared/Identicon'

import { changeCommentInProgress, createComment } from 'redux/actions'

import type { IntlShape } from 'react-intl'
import type { ExtractReturn, State } from 'redux/state'
import type { Dispatch } from 'redux/actions'

type OwnProps = {|
  intl: IntlShape,
  onResize: number => mixed,
  threadId: string,
|}

function mapStateToProps ({ caseData, ui }: State, { threadId }: OwnProps) {
  const { reader } = caseData
  const editorState =
    ui.commentInProgress[threadId] || EditorState.createEmpty()
  const editorHasFocus = editorState.getSelection().getHasFocus()
  return { editorHasFocus, editorState, reader }
}

function mapDispatchToProps (dispatch: Dispatch, { threadId }: OwnProps) {
  return {
    handleChange: (editorState: EditorState) =>
      dispatch(changeCommentInProgress(threadId, editorState)) && void 0,
    handleSubmit: () => dispatch(createComment(threadId)),
  }
}

type StateProps = ExtractReturn<typeof mapStateToProps>
type DispatchProps = ExtractReturn<typeof mapDispatchToProps>
type Props = { ...OwnProps, ...StateProps, ...DispatchProps }

class NewCommentForm extends React.Component<Props> {
  container: ?HTMLDivElement

  componentDidUpdate (prevProps) {
    if (this.props.editorState === prevProps.editorState) return
    const height = this.container && this.container.offsetHeight
    height && this.props.onResize(height)
  }

  render () {
    const {
      editorHasFocus,
      editorState,
      handleChange,
      handleSubmit,
      intl,
      reader,
    } = this.props
    if (reader == null) return null
    return (
      <Container innerRef={(el: HTMLDivElement) => (this.container = el)}>
        <Identicon width={32} reader={reader} />
        <Input>
          <Editor
            editorState={editorState}
            placeholder={intl.formatMessage({
              id: 'comments.write',
              defaultMessage: 'Write a reply...',
            })}
            onChange={handleChange}
          />
        </Input>
        <SendButton
          aria-label={intl.formatMessage({
            id: 'comments.respond',
            defaultMessage: 'Respond',
          })}
          className="pt-button pt-small pt-minimal pt-intent-primary pt-icon-upload"
          editorHasFocus={editorHasFocus}
          onClick={handleSubmit}
        />
      </Container>
    )
  }
}
export default injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(NewCommentForm)
)

const Container = styled.div`
  display: flex;
  align-items: flex-end;
  background-color: #ebeae4;
  border-top: 1px solid #bfbdac;
  border-radius: 0 0 2px 2px;
  padding: 11px;

  & .Identicon {
    margin-bottom: 1px;
  }
`

const Input = styled.div`
  background-color: white;
  border-radius: 20px;
  margin-left: 10px;
  padding: 8px 30px 7px 16px;
  flex: 1;
  min-height: 34px;
  max-height: 105px;
  overflow: scroll;
  font-size: 14px;
  line-height: 1.3;

  & .public-DraftEditorPlaceholder-root {
    position: absolute;
    pointer-events: none;
    opacity: 0.6;
    &.public-DraftEditorPlaceholder-hasFocus {
      opacity: 0.3;
    }
  }
`

const SendButton = styled.button`
  position: absolute;
  right: 16px;
  bottom: 16px;
  border-radius: 100%;
  ${({ editorHasFocus }) =>
    editorHasFocus ||
    css`
      &:not(:hover):not(:focus)::before {
        color: #5c7080 !important;
      }
    `};
`
