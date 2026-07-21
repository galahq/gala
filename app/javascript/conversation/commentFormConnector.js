/**
 * @providesModule commentFormConnector
 * 
 */

import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'

import { changeCommentInProgress, createComment } from 'redux/actions'

import { EditorState } from 'draft-js'



function mapStateToProps (
  { caseData, ui },
  { threadId }
) {
  const { reader } = caseData
  const editorState =
    ui.commentInProgress[threadId] || EditorState.createEmpty()
  return { editorState, reader }
}

function mapDispatchToProps (
  dispatch,
  { threadId }
) {
  return {
    onSaveChanges: (editorState) =>
      dispatch(changeCommentInProgress(threadId, editorState)) && void 0,
    onSubmitComment: (editorState, attachmentIds) =>
      dispatch(createComment(threadId, editorState, attachmentIds)),
  }
}


export default (component) =>
  injectIntl(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(component)
  )
