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
    onSaveChanges: (editorState: EditorState) =>
      dispatch(changeCommentInProgress(threadId, editorState)) && void 0,
    onSubmitComment: () => dispatch(createComment(threadId)),
  }
}

type StateProps = ExtractReturn<typeof mapStateToProps>
type DispatchProps = ExtractReturn<typeof mapDispatchToProps>
type Props = { ...OwnProps, ...StateProps, ...DispatchProps }

class NewCommentForm extends React.Component<
  Props,
  { editorState: EditorState }
> {
  state = { editorState: this.props.editorState }

  container: ?HTMLDivElement

  componentDidUpdate (prevProps: Props) {
    if (prevProps.threadId !== this.props.threadId) {
      this.setState({ editorState: this.props.editorState })
    }
    this._updateHeight()
  }

  render () {
    const { editorHasFocus, onSubmitComment, intl, reader } = this.props
    const { editorState } = this.state
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
            onChange={this.handleChange}
            onBlur={this.handleBlur}
          />
        </Input>
        <SendButton
          aria-label={intl.formatMessage({
            id: 'comments.respond',
            defaultMessage: 'Respond',
          })}
          className="pt-button pt-small pt-minimal pt-intent-primary pt-icon-upload"
          editorHasFocus={editorHasFocus}
          onClick={onSubmitComment}
        />
      </Container>
    )
  }

  handleChange = editorState => this.setState({ editorState })
  handleBlur = () => this.props.onSaveChanges(this.state.editorState)

  _updateHeight = () => {
    console.log('_updateHeight')
    const height = this.container && this.container.offsetHeight
    height && this.props.onResize(height)
  }
}
export default injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(NewCommentForm)
)

const Container = styled.div`
  flex-shrink: 0;
  background-color: #ebeae4;
  border-top: 1px solid #bfbdac;
  border-radius: 0 0 2px 2px;
  display: flex;
  align-items: flex-end;
  padding: 11px;
  position: relative;

  & .Identicon {
    margin-bottom: 1px;
  }

  @media (max-width: 700px) {
    margin: 0 6px;
    bottom: 0;
    width: calc(100vw - 12px);
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

  &:focus-within {
    outline: none;
    box-shadow: 0 0 0 1px #7351d4, 0 0 0 3px rgba(115, 81, 212, 0.3),
      inset 0 1px 1px rgba(16, 22, 26, 0.2);
  }

  & .public-DraftEditorPlaceholder-root {
    margin-bottom: -18px;
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
