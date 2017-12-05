/**
 * @providesModule FirstPostForm
 * @flow
 */

import * as React from 'react'
import styled from 'styled-components'

import { Editor, EditorState } from 'draft-js'

import commentFormConnector from 'conversation/commentFormConnector'
import type {
  OwnProps,
  StateProps,
  DispatchProps,
} from 'conversation/commentFormConnector'

type Props = { ...OwnProps, ...StateProps, ...DispatchProps }
type State = { editorState: EditorState }
class FirstPostForm extends React.Component<Props, State> {
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
    const { intl, onSubmitComment } = this.props
    const { editorState } = this.state
    return [
      <Input key="1">
        <Editor
          editorState={editorState}
          placeholder={intl.formatMessage({
            id: 'comments.write',
            defaultMessage: 'Write a reply...',
          })}
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
          Submit
        </SubmitButton>
      </Options>,
    ]
  }

  handleChange = editorState => this.setState({ editorState })
  handleBlur = () => this.props.onSaveChanges(this.state.editorState)
}
export default commentFormConnector(FirstPostForm)

const Input = styled.div`
  background-color: white;
  border-radius: 2px;
  padding: 12px 16px;
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
