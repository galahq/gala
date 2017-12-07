/**
 * @providesModule commentFormConnector
 * @flow
 */

import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'

import { changeCommentInProgress, createComment } from 'redux/actions'

import { EditorState } from 'draft-js'

import type { IntlShape } from 'react-intl'
import type { ExtractReturn, State } from 'redux/state'
import type { Dispatch } from 'redux/actions'

export type CommentFormProps = {|
  intl: IntlShape,
  threadId: string,
|}

function mapStateToProps (
  { caseData, ui }: State,
  { threadId }: CommentFormProps
) {
  const { reader } = caseData
  const editorState =
    ui.commentInProgress[threadId] || EditorState.createEmpty()
  return { editorState, reader }
}

function mapDispatchToProps (
  dispatch: Dispatch,
  { threadId }: CommentFormProps
) {
  return {
    onSaveChanges: (editorState: EditorState) =>
      dispatch(changeCommentInProgress(threadId, editorState)) && void 0,
    onSubmitComment: () => dispatch(createComment(threadId)),
  }
}

export type StateProps = ExtractReturn<typeof mapStateToProps>
export type DispatchProps = ExtractReturn<typeof mapDispatchToProps>

export default (component: React.ComponentType<*>) =>
  injectIntl(connect(mapStateToProps, mapDispatchToProps)(component))
