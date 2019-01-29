/**
 * @providesModule ResponseForm
 * @flow
 */
import React, { useRef, useState, useEffect } from 'react'
import styled from 'styled-components'
import Identicon from 'shared/Identicon'
import CommentEditor from 'conversation/CommentEditor'
import commentFormConnector from 'conversation/commentFormConnector'
import type {
  CommentFormProps,
  StateProps,
  DispatchProps,
} from 'conversation/commentFormConnector'
type Props = {
  ...CommentFormProps,
  ...StateProps,
  ...DispatchProps,
  onResize: number => mixed,
}
function ResponseForm ({
  editorState: editorStateFromProps,
  intl,
  threadId,
  reader,
  onSaveChanges,
  onSubmitComment,
  onResize,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  const [editorState, setEditorState] = useState(editorStateFromProps)

  useEffect(
    () => {
      setEditorState(editorStateFromProps)
    },
    [threadId, editorStateFromProps]
  )

  function updateHeight () {
    const height = containerRef.current?.offsetHeight
    height && onResize(height)
  }

  useEffect(() => {
    updateHeight()
  })

  if (reader == null) return null

  return (
    // $FlowFixMe
    <Container ref={containerRef}>
      <Identicon width={32} reader={reader} />
      <Input>
        <CommentEditor
          editorState={editorState}
          onChange={eS => setEditorState(eS)}
          onBlur={() => onSaveChanges(editorState)}
        />
      </Input>
      <SendButton
        aria-label={intl.formatMessage({
          id: 'comments.new.respond',
        })}
        className="pt-button pt-small pt-minimal pt-intent-primary pt-icon-upload"
        disabled={
          editorState
            .getCurrentContent()
            .getPlainText()
            .trim() === ''
        }
        onClick={() => onSubmitComment(editorState, [])}
      />
    </Container>
  )
}
export default commentFormConnector(ResponseForm)
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
  }
`
// $FlowFixMe
export const EmptyResponseFormContainer = styled(Container)`
  border-top: none;
  padding: 1px;
`
const Input = styled.div.attrs({ className: 'pt-card' })`
  background-color: white;
  border-radius: 20px;
  margin-left: 10px;
  padding: 8px 30px 7px 16px;
  flex: 1;
  min-height: 34px;
  max-height: 105px;
  overflow: auto;
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
`
