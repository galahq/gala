/**
 * @providesModule FirstPostForm
 * @flow
 */

import * as React from 'react'
import styled from 'styled-components'

import { EditorState } from 'draft-js'
import { FormattedMessage } from 'react-intl'
import { DirectUploadProvider } from 'react-activestorage-provider'

import CommentEditor from 'conversation/CommentEditor'
import commentFormConnector from 'conversation/commentFormConnector'
import CommentAttachmentsChooser from 'conversation/CommentAttachmentsChooser'
import FormattingToolbar from 'draft/FormattingToolbar'

import type { Editor } from 'draft-js'
import type {
  CommentFormProps,
  StateProps,
  DispatchProps,
} from 'conversation/commentFormConnector'

type OwnProps = {
  onCancel: (SyntheticMouseEvent<*>) => Promise<any>,
}
type Props = {
  ...OwnProps,
  ...CommentFormProps,
  ...StateProps,
  ...DispatchProps,
}
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
    const { onCancel } = this.props
    const { editorState } = this.state
    return (
      <DirectUploadProvider
        multiple
        render={({ ready, uploads, handleChooseFiles, handleBeginUpload }) => (
          <>
            <Input onClick={this.handleFocusEditor}>
              <FormattingToolbar
                actions={{ addEdgenoteEntity: false, addCitationEntity: false, addMathEntity: false, addRevealableEntity: false, code: false, subscript: false, superscript: false}}
                editorState={editorState}
                onChange={this.handleChange}
              />
              <CommentEditor
                innerRef={ref => (this.editor = ref)}
                editorState={editorState}
                onChange={this.handleChange}
                onBlur={this.handleBlur}
              />
              <CommentAttachmentsChooser
                attachments={uploads}
                onChange={handleChooseFiles}
              />
            </Input>
            <Options>
              <Button onClick={onCancel}>
                <FormattedMessage id="helpers.cancel" />
              </Button>
              <SubmitButton
                disabled={
                  !ready ||
                  editorState
                    .getCurrentContent()
                    .getPlainText()
                    .trim() === ''
                }
                onClick={handleBeginUpload}
              >
                <FormattedMessage id="helpers.submit.submit" />
              </SubmitButton>
            </Options>
          </>
        )}
        onSuccess={this.handleSubmitComment}
      />
    )
  }

  handleChange = editorState => this.setState({ editorState })
  handleSubmitComment = attachmentIds => {
    this.props.onSubmitComment(this.props.editorState, attachmentIds)
  }

  handleBlur = () => this.props.onSaveChanges(this.state.editorState)
  handleFocusEditor = () =>
    requestAnimationFrame(() => {
      this.editor && this.editor.focus()
    })
}
export default commentFormConnector(FirstPostForm)

const Input = styled.div.attrs({ className: 'pt-card pt-elevation-1' })`
  align-items: stretch;
  background-color: white;
  display: flex;
  flex-direction: column;
  font-size: 17px;
  line-height: 1.3;
  margin-top: 28px;
  min-height: 235px;
  padding: 8px 16px 12px;
  position: relative;

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

const Button = styled.button.attrs({ className: 'pt-button' })``
const SubmitButton = styled.button.attrs({
  className: 'pt-button pt-intent-primary',
})`
  margin-left: 8px;
`
