import { Orchard } from 'concerns/orchard.js'
import { convertToRaw } from 'draft-js'
import { Intent } from '@blueprintjs/core'

// GENERAL
//
export const TOGGLE_EDITING = "TOGGLE_EDITING"
export function toggleEditing() {
  return {type: TOGGLE_EDITING}
}

export function saveChanges() {
  return (dispatch, getState) => {
    const state = {...getState()}

    dispatch(clearUnsaved())
    dispatch(displayToast({
      message: "Saved successfully",
      intent: Intent.SUCCESS,
    }))
    window.onbeforeunload = null

    Object.keys(state.edit.unsavedChanges).forEach(
      endpoint => {
        saveModel(
          endpoint === 'caseData' ? `cases/${state.caseData.slug}` : endpoint,
          state)
      }
    )
  }
}

async function saveModel(endpoint, state) {
  const [model, id] = endpoint.split('/')

  let data
  switch (model) {
    case 'cases': {
      const {published, kicker, title, dek, slug, photoCredit, summary,
        baseCoverUrl} = state.caseData
      data = {
        case: {
          published, kicker, title, dek, slug, photoCredit, summary,
          coverUrl: baseCoverUrl,
        },
      }
    }
      break

    case 'cards': {
      const {editorState} = state.cardsById[id]
      data = {
        card: {
          rawContent:
            JSON.stringify(convertToRaw(editorState.getCurrentContent())),
        },
      }
    }
      break

    case 'pages': {
      const { title, position } = state.pagesById[id]
      data = {
        page: {
          title,
          position,
        },
      }
    }
      break

    case 'edgenotes': {
      data = { edgenote: state.edgenotesBySlug[id] }
    }
      break

    default:
      throw "Bad model."
  }

  return await Orchard.espalier(endpoint, data)
}

const setUnsaved = () => window.onbeforeunload = () =>
  "You have unsaved changes. Are you sure you want to leave?"

export const CLEAR_UNSAVED = "CLEAR_UNSAVED"
function clearUnsaved() {
  return { type: CLEAR_UNSAVED }
}

// CASE
//
export const UPDATE_CASE = "UPDATE_CASE"
export function updateCase(slug, data) {
  setUnsaved()
  return {type: UPDATE_CASE, data}
}

export function enrollReader(readerId, caseSlug) {
  return async (dispatch) => {
    const enrollment = await Orchard.espalier(
      `admin/cases/${caseSlug}/readers/${readerId}/enrollments/upsert`
    )
    dispatch(setReaderEnrollment(enrollment))
  }
}

export const SET_READER_ENROLLMENT = "SET_READER_ENROLLMENT"
function setReaderEnrollment(enrollment) {
  return {type: SET_READER_ENROLLMENT, enrollment}
}

export const UPDATE_CASE_ELEMENT = "UPDATE_CASE_ELEMENT"
export function updateCaseElement(id, index) {
  return {type: UPDATE_CASE_ELEMENT, id, index}
}

export const UPDATE_CASE_ELEMENTS = "UPDATE_CASE_ELEMENTS"
function updateCaseElements(caseData) {
  return {type: UPDATE_CASE_ELEMENTS, data: caseData}
}
export function persistCaseElementReordering(id, index) {
  return async dispatch => {
    const caseElements = await Orchard.espalier(
      `case_elements/${id}`,
      { case_element: { position: index + 1 } }
    )
    dispatch(updateCaseElements({caseElements}))
  }
}

export const REMOVE_ELEMENT = "REMOVE_ELEMENT"
function removeElement(position) {
  return {type: REMOVE_ELEMENT, position}
}

export function deleteElement(elementUrl, position) {
  return async dispatch => {
    if (window.confirm("Are you sure you want to delete this element? This action cannot be undone.")) {
      await Orchard.prune(`${elementUrl}`)
      dispatch(removeElement(position))
    }
  }
}

// PAGE
//
export const ADD_PAGE = "ADD_PAGE"
function addPage(data) {
  return {type: ADD_PAGE, data}
}

export function createPage(caseSlug) {
  return async dispatch => {
    const data = await Orchard.graft(
      `cases/${caseSlug}/pages`,
      {}
    )
    dispatch(addPage(data))
  }
}

export const UPDATE_PAGE = "UPDATE_PAGE"
export function updatePage(id, data) {
  setUnsaved()
  return {type: UPDATE_PAGE, id, data}
}

// PODCAST
//
export const ADD_PODCAST = "ADD_PODCAST"
function addPodcast(data) {
  return {type: ADD_PODCAST, data}
}

export function createPodcast(caseSlug) {
  return async dispatch => {
    const data = await Orchard.graft(
      `cases/${caseSlug}/podcasts`,
      {}
    )
    dispatch(addPodcast(data))
  }
}

// ACTIVITY
//
export const ADD_ACTIVITY = "ADD_ACTIVITY"
function addActivity(data) {
  return {type: ADD_ACTIVITY, data}
}

export function createActivity(caseSlug) {
  return async dispatch => {
    const data = await Orchard.graft(
      `cases/${caseSlug}/activities`,
      {}
    )
    dispatch(addActivity(data))
  }
}


// CARD
//
export const PARSE_ALL_CARDS = "PARSE_ALL_CARDS"
export function parseAllCards() {
  return { type: PARSE_ALL_CARDS }
}

export const UPDATE_CARD_CONTENTS = "UPDATE_CARD_CONTENTS"
export function updateCardContents(id, editorState) {
  setUnsaved()
  return {type: UPDATE_CARD_CONTENTS, id, editorState}
}

export const REPLACE_CARD = "REPLACE_CARD"
export function replaceCard(cardId, newCard) {
  return { type: REPLACE_CARD, cardId, newCard }
}

export const OPEN_CITATION = "OPEN_CITATION"
export function openCitation(key, labelRef) {
  return {type: OPEN_CITATION, data: {key, labelRef}}
}

// SELECTION
//
export const ACCEPT_SELECTION = "ACCEPT_SELECTION"
export function acceptSelection() {
  clearSelection()
  return {type: ACCEPT_SELECTION}
}
function clearSelection() {
  if ( document.selection  ) {
    document.selection.empty();
  } else if ( window.getSelection  ) {
    window.getSelection().removeAllRanges();
  }
}

export const APPLY_SELECTION = "APPLY_SELECTION"
export function applySelection(cardId, selectionState) {
  return { type: APPLY_SELECTION, cardId, selectionState }
}

// COMMENT THREAD
//
export function createCommentThread(cardId, editorState) {
  return async (dispatch) => {
    const selection = editorState.getSelection()
    const start = selection.getStartOffset()
    const end = selection.getEndOffset()
    const length = end - start

    const blocks = editorState.getCurrentContent().getBlocksAsArray()
    const blockKey = selection.getStartKey()
    const blockIndex = blocks.findIndex(b => b.getKey() === blockKey)

    const originalHighlightText = blocks[blockIndex].getText().slice(start, end)

    const newCommentThread = await Orchard.graft(`cards/${cardId}/comment_threads`, {
      commentThread: { blockIndex, start, length, originalHighlightText },
    })

    dispatch(addCommentThread(newCommentThread))
    dispatch(selectCommentThread(newCommentThread.id))
  }
}

export const ADD_COMMENT_THREAD = "ADD_COMMENT_THREAD"
export function addCommentThread(data) {
  return {type: ADD_COMMENT_THREAD, data}
}

export function deleteCommentThread(threadId, cardId) {
  return async (dispatch) => {
    await Orchard.prune(`comment_threads/${threadId}`)
    dispatch(selectCommentThread(null))
    dispatch(removeCommentThread(threadId, cardId))
  }
}

export const REMOVE_COMMENT_THREAD = "REMOVE_COMMENT_THREAD"
function removeCommentThread(threadId, cardId) {
  return {type: REMOVE_COMMENT_THREAD, threadId, cardId}
}

export const OPEN_COMMENT_THREADS = "OPEN_COMMENT_THREADS"
export function openCommentThreads(cardId) {
  return {type: OPEN_COMMENT_THREADS, cardId}
}

export const SELECT_COMMENT_THREAD = "SELECT_COMMENT_THREAD"
export function selectCommentThread(id) {
  return {type: SELECT_COMMENT_THREAD, id}
}

export const HOVER_COMMENT_THREAD = "HOVER_COMMENT_THREAD"
export function hoverCommentThread(id) {
  return {type: HOVER_COMMENT_THREAD, id}
}

export function closeCommentThreads() {
  return dispatch => {
    dispatch(openCommentThreads(null))
    dispatch(selectCommentThread(null))
  }
}

// COMMENT
//
export const CHANGE_COMMENT_IN_PROGRESS = "CHANGE_COMMENT_IN_PROGRESS"
export function changeCommentInProgress(threadId, content) {
  return { type: CHANGE_COMMENT_IN_PROGRESS, threadId, content }
}

export const ADD_COMMENT = "ADD_COMMENT"
export function addComment(data) {
  return { type: ADD_COMMENT, data }
}

export function createComment(threadId, content) {
  return dispatch => {
    Orchard.graft(
      `comment_threads/${threadId}/comments`,
      { comment: { content } },
    ).then(() => {
      dispatch(changeCommentInProgress(threadId, ""))
    }).catch(error => {
      dispatch(displayToast({
        message: `Error saving: ${error.message}`,
        intent: Intent.WARNING,
      }))
    })
  }
}


// EDGENOTE
//
export const CREATE_EDGENOTE = "CREATE_EDGENOTE"
export function createEdgenote(slug, data) {
  return {type: CREATE_EDGENOTE, slug, data}
}

export const UPDATE_EDGENOTE = "UPDATE_EDGENOTE"
export function updateEdgenote(slug, data) {
  setUnsaved()
  return {type: UPDATE_EDGENOTE, slug, data}
}

export const HIGHLIGHT_EDGENOTE = "HIGHLIGHT_EDGENOTE"
export function highlightEdgenote(slug) {
  return {type: HIGHLIGHT_EDGENOTE, slug}
}

export const ACTIVATE_EDGENOTE = "ACTIVATE_EDGENOTE"
export function activateEdgenote(slug) {
  return {type: ACTIVATE_EDGENOTE, slug}
}

// TOASTS
//
export const REGISTER_TOASTER = "REGISTER_TOASTER"
export function registerToaster(toaster) {
  return {type: REGISTER_TOASTER, toaster}
}
export const DISPLAY_TOAST = "DISPLAY_TOAST"
export function displayToast(options) {
  return {type: DISPLAY_TOAST, options}
}

export const HANDLE_NOTIFICATION = "HANDLE_NOTIFICATION"
export function handleNotification(notification) {
  return dispatch => {
    dispatch(displayToast({
      message: notification.message,
      intent: Intent.PRIMARY,
      action: {
        href: `/cases/${notification.case.slug}#/${notification.page.position}`,
        text: 'Read',
      },
    }))
  }
}
