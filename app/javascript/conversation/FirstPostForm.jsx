/**
 * @providesModule FirstPostForm
 * @flow
 */

import * as React from 'react'
import styled from 'styled-components'

import { EditorState } from 'draft-js'
import { FormattedMessage } from 'react-intl'

import CommentEditor from 'conversation/CommentEditor'
import commentFormConnector from 'conversation/commentFormConnector'
import FormattingToolbar from 'conversation/FormattingToolbar'

import type { Editor } from 'draft-js'
import type {
  OwnProps,
  StateProps,
  DispatchProps,
} from 'conversation/commentFormConnector'

type Props = { ...OwnProps, ...StateProps, ...DispatchProps }
type State = { editorState: EditorState }
class FirstPostForm extends React.Component<Props, State> {
  editor: ?Editor

  state = { editorState: this.props.editorState }

  componentDidUpdate (prevProps: Props) {
    if (
      prevProps.threadId !== this.props.threadId ||
      prevProps.editorState !== this.props.editorState
    ) {
      this.setState({ editorState: this.props.editorState })
    }
  }

  render () {
    const { onSubmitComment } = this.props
    const { editorState } = this.state
    return [
      <Input key="1" onClick={this.handleFocusEditor}>
        <FormattingToolbar
          editorState={editorState}
          onChange={this.handleChange}
        />
        <CommentEditor
          innerRef={ref => (this.editor = ref)}
          editorState={editorState}
          onChange={this.handleChange}
          onBlur={this.handleBlur}
        />
      </Input>,
      <Options key="2">
        <SubmitButton
          disabled={
            editorState
              .getCurrentContent()
              .getPlainText()
              .trim() === ''
          }
          onClick={onSubmitComment}
        >
          <FormattedMessage id="submit" defaultMessage="Submit" />
        </SubmitButton>
      </Options>,
    ]
  }

  handleChange = editorState => this.setState({ editorState })
  handleBlur = () => this.props.onSaveChanges(this.state.editorState)
  handleFocusEditor = () => this.editor && this.editor.focus()
}
export default commentFormConnector(FirstPostForm)

const Input = styled.div.attrs({ className: 'pt-card pt-elevation-1' })`
  background-color: white;
  padding: 8px 16px 12px;
  min-height: 235px;

  font-size: 17px;
  line-height: 1.3;

  & .public-DraftEditorPlaceholder-root {
    margin-bottom: -20px;
    pointer-events: none;
    opacity: 0.6;
    &.public-DraftEditorPlaceholder-hasFocus {
      opacity: 0.3;
    }
  }
`

const Options = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
`

const SubmitButton = styled.button.attrs({
  className: 'pt-button pt-intent-primary',
})``
