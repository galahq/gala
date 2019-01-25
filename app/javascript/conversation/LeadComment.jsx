/**
 * @providesModule LeadComment
 * @flow
 */

import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'

import { EditorState, convertFromRaw } from 'draft-js'
import { markdownToDraft } from 'markdown-draft-js'

import { Button } from '@blueprintjs/core'
import { injectIntl, FormattedMessage, FormattedRelative } from 'react-intl'

import { useToggle } from 'utility/hooks'
import { deleteComment, updateComment } from 'redux/actions'

import CommentEditor from 'conversation/CommentEditor'

import {
  StyledComment,
  ConversationTimestamp,
  SmallGreyText,
} from 'conversation/shared'

import type { IntlShape } from 'react-intl'
import type { Dispatch } from 'redux/actions'
import type { State, ReaderState, Comment } from 'redux/state'

type OwnProps = {
  intl: IntlShape,
  leadComment: Comment,
  responseCount: number,
  onCancel: (SyntheticMouseEvent<*>) => Promise<any>,
}

type StateProps = {
  readerCanDeleteComments: boolean,
  currentReader: ?ReaderState,
}

function mapStateToProps ({
  commentThreadsById,
  forums,
  caseData: { reader },
}: State) {
  return {
    readerCanDeleteComments: forums.find(forum => forum.community.active)
      ?.moderateable,
    currentReader: reader,
  }
}

type DispatchProps = {
  handleDeleteThread: (SyntheticMouseEvent<*>) => Promise<any>,
  updateComment: typeof updateComment,
}

function mapDispatchToProps (
  dispatch: Dispatch,
  { leadComment: { id }, onCancel }: OwnProps
) {
  return {
    handleDeleteThread: (e: SyntheticMouseEvent<*>) =>
      dispatch(deleteComment(id)).then(() => onCancel(e)),
    updateComment: (...args) => dispatch(updateComment(...args)),
  }
}

type Props = OwnProps & StateProps & DispatchProps

function LeadComment ({
  currentReader,
  handleDeleteThread,
  intl,
  leadComment,
  readerCanDeleteComments,
  responseCount,
  updateComment,
}: Props) {
  const [editing, toggleEditing] = useToggle()
  const [editorState, setEditorState] = useState(
    EditorState.createWithContent(
      convertFromRaw(markdownToDraft(leadComment.content))
    ) || null
  )

  useEffect(
    () => {
      if (editing) toggleEditing()
    },
    [leadComment.content]
  )

  return editing ? (
    <>
      <InputGroup>
        <Input>
          <CommentEditor editorState={editorState} onChange={setEditorState} />
        </Input>

        <Button
          aria-label={intl.formatMessage({ id: 'helpers.cancel' })}
          onClick={() => {
            toggleEditing()
            setEditorState(
              EditorState.createWithContent(
                convertFromRaw(markdownToDraft(leadComment.content))
              )
            )
          }}
        >
          <FormattedMessage id="helpers.cancel" />
        </Button>

        <Button
          aria-label={intl.formatMessage({
            id: 'comments.edit.saveComment',
          })}
          onClick={() => updateComment(leadComment.id, editorState)}
        >
          <FormattedMessage id="helpers.save" />
        </Button>
      </InputGroup>
    </>
  ) : (
    <LeadCommentContents>
      <Row>
        <div>
          <SmallGreyText>
            <ConversationTimestamp value={leadComment.timestamp} />
          </SmallGreyText>
          {currentReader && leadComment.reader.id === currentReader.id && (
            <EditButton
              aria-label={intl.formatMessage({
                id: 'comments.edit.editComment',
              })}
              onClick={toggleEditing}
            >
              <FormattedMessage id="helpers.edit" />
            </EditButton>
          )}
        </div>
        {readerCanDeleteComments && responseCount === 0 && (
          <DeleteButton
            aria-label={intl.formatMessage({
              id: 'commentThreads.destroy.deleteCommentThread',
            })}
            onClick={handleDeleteThread}
          />
        )}
      </Row>
      <blockquote>
        <StyledComment markdown={leadComment.content} />
        {leadComment.timestamp !== leadComment.updatedAt && (
          <Edited>
            <FormattedMessage
              id="comments.comment.edited"
              values={{
                someTimeAgo: (
                  <FormattedRelative value={leadComment.updatedAt} />
                ),
              }}
            />
          </Edited>
        )}
      </blockquote>
      {leadComment.attachments?.length > 0 && (
        <AttachmentsSection>
          <SmallGreyText>
            <FormattedMessage id="activerecord.attributes.comment.attachments" />
          </SmallGreyText>
          <ul>
            {leadComment.attachments.map((attachment, i) => (
              <li className="pt-tag pt-minimal pt-interactive" key={i}>
                <a href={attachment.url}>{attachment.name}</a>
              </li>
            ))}
          </ul>
        </AttachmentsSection>
      )}
    </LeadCommentContents>
  )
}

export default injectIntl(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(LeadComment)
)

const Edited = styled.span`
  font-size: 13px;
  opacity: 0.7;
`

const InputGroup = styled.div`
  flex-grow: 1;
  margin: 6px 0 0 44px;
`

const Input = styled.div.attrs({ className: 'pt-input' })`
  height: auto;
  margin-bottom: 6px;
  padding: 5px 10px;
  width: 100%;

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

const LeadCommentContents = styled.div`
  margin: 20px 0 50px;

  &:last-child {
    margin-bottom: 0;
  }

  & > blockquote {
    padding: 0;
    margin: 0;
    border: none;
    font-size: 17px;
    line-height: 1.3;
  }
`

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
`

const EditButton = styled.button.attrs({
  className: 'pt-button pt-minimal pt-intent-primary',
})`
  &:hover {
    background: none !important;
    text-decoration: underline !important;
  }

  &:focus {
    outline-offset: -3px;
  }
`

const DeleteButton = styled.button.attrs({
  className: 'pt-button pt-intent-danger pt-icon-trash pt-minimal',
})`
  transition: opacity 0.2s;
  opacity: 0;
  ${LeadCommentContents}:hover & {
    opacity: 1;
  }
`

const AttachmentsSection = styled.div`
  margin-top: 1em;

  ul {
    line-height: 1.6;
    list-style: none;
    margin: 0;
    padding: 0;

    li {
      margin-right: 0.5em;

      a:link {
        color: black;
      }
    }
  }
`
