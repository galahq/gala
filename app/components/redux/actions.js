// @flow
import { Orchard } from 'concerns/orchard'
import { convertToRaw } from 'draft-js'
import { Intent } from '@blueprintjs/core'

import type { EditorState, SelectionState } from 'draft-js'

import type {
  State,
  CaseDataState,
  CaseElement,
  Card,
  Page,
  Podcast,
  Activity,
  Comment,
  CommentThread,
  Edgenote,
  Notification,
} from 'redux/state'

export type Action =
  ToggleEditingAction |
  ClearUnsavedAction |
  UpdateCaseAction |
  SetReaderEnrollmentAction |
  UpdateCaseElementAction |
  UpdateCaseElementsAction |
  RemoveElementAction |
  AddPageAction |
  UpdatePageAction |
  AddPodcastAction |
  UpdatePodcastAction |
  AddActivityAction |
  UpdateActivityAction |
  ParseAllCardsAction |
  UpdateCardContentsAction |
  ReplaceCardAction |
  OpenCitationAction |
  AcceptSelectionAction |
  ApplySelectionAction |
  AddCommentThreadAction |
  RemoveCommentThreadAction |
  HoverCommentThreadAction |
  ChangeCommentInProgressAction |
  AddCommentAction |
  CreateEdgenoteAction |
  UpdateEdgenoteAction |
  HighlightEdgenoteAction |
  ActivateEdgenoteAction |
  RegisterToasterAction |
  DisplayToastAction

type GetState = () => State
type PromiseAction = Promise<Action>
type ThunkAction = (dispatch: Dispatch, getState: GetState) => any
type Dispatch = (action: Action | ThunkAction | PromiseAction | Array<Action>) => any

// API

export type ToggleEditingAction = { type: 'TOGGLE_EDITING' };
export function toggleEditing (): ToggleEditingAction {
  return { type: 'TOGGLE_EDITING' }
}

export function saveChanges (): ThunkAction {
  return (dispatch: Dispatch, getState: GetState) => {
    const state = getState()

    dispatch(clearUnsaved())
    dispatch(displayToast({
      message: 'Saved successfully',
      intent: Intent.SUCCESS,
    }))
    window.onbeforeunload = null

    Object.keys(state.edit.unsavedChanges).forEach(
      (endpoint) => {
        saveModel(
          endpoint === 'caseData' ? `cases/${state.caseData.slug}` : endpoint,
          state)
      },
    )
  }
}

async function saveModel (endpoint: string, state: State): Promise<Object> {
  const [model, id] = endpoint.split('/')

  let data
  switch (model) {
    case 'cases': {
      const { published, kicker, title, dek, slug, photoCredit, summary,
        baseCoverUrl } = state.caseData
      data = {
        case: {
          published,
          kicker,
          title,
          dek,
          slug,
          photoCredit,
          summary,
          coverUrl: baseCoverUrl,
        },
      }
    }
      break

    case 'cards': {
      const { editorState } = state.cardsById[id]
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

    case 'podcasts': {
      const { credits, title, artworkUrl, audioUrl,
        photoCredit } = state.podcastsById[id]
      data = {
        podcast: {
          credits: JSON.stringify(credits),
          title,
          artworkUrl,
          audioUrl,
          photoCredit,
        },
      }
    }
      break

    case 'activities': {
      const { title, pdfUrl, iconSlug } = state.activitiesById[id]
      data = {
        activity: {
          title,
          pdfUrl,
          iconSlug,
        },
      }
    }
      break

    case 'edgenotes':
      data = { edgenote: state.edgenotesBySlug[id] }

      break

    default:
      throw Error('Bad model.')
  }

  return await Orchard.espalier(endpoint, data)
}

const setUnsaved = () => {
  window.onbeforeunload = () => 'You have unsaved changes. Are you sure you ' +
  'want to leave?'
}

export type ClearUnsavedAction = { type: 'CLEAR_UNSAVED' }
function clearUnsaved (): ClearUnsavedAction {
  return { type: 'CLEAR_UNSAVED' }
}

// CASE
//
export type UpdateCaseAction = { type: 'UPDATE_CASE', data: CaseDataState }
export function updateCase (
  slug: string,
  data: $Subtype<CaseDataState>
): UpdateCaseAction {
  setUnsaved()
  return { type: 'UPDATE_CASE', data }
}

export function enrollReader (readerId: string, caseSlug: string): ThunkAction {
  return async (dispatch: Dispatch) => {
    const enrollment = await Orchard.espalier(
      `admin/cases/${caseSlug}/readers/${readerId}/enrollments/upsert`
    )
    dispatch(setReaderEnrollment(enrollment))
  }
}

export type SetReaderEnrollmentAction = {
  type: 'SET_READER_ENROLLMENT',
  enrollment: boolean,
}
function setReaderEnrollment (enrollment: boolean): SetReaderEnrollmentAction {
  return { type: 'SET_READER_ENROLLMENT', enrollment }
}

export type UpdateCaseElementAction = {
  type: 'UPDATE_CASE_ELEMENT',
  id: number,
  index: number,
}
export function updateCaseElement (
  id: number,
  index: number,
): UpdateCaseElementAction {
  return { type: 'UPDATE_CASE_ELEMENT', id, index }
}

export type UpdateCaseElementsAction = {
  type: 'UPDATE_CASE_ELEMENTS',
  data: { caseElements: CaseElement[] },
}
function updateCaseElements (
  data: {caseElements: CaseElement[]}
): UpdateCaseElementsAction {
  return { type: 'UPDATE_CASE_ELEMENTS', data }
}
export function persistCaseElementReordering (
  id: string,
  index: number,
): ThunkAction {
  return async (dispatch: Dispatch) => {
    const caseElements = (await Orchard.espalier(
      `case_elements/${id}`,
      { case_element: { position: index + 1 }}
    ): CaseElement[])
    dispatch(updateCaseElements({ caseElements }))
  }
}

export type RemoveElementAction = { type: 'REMOVE_ELEMENT', position: number }
function removeElement (position): RemoveElementAction {
  return { type: 'REMOVE_ELEMENT', position }
}

export function deleteElement (
  elementUrl: string,
  position: number
): ThunkAction {
  return async (dispatch: Dispatch) => {
    if (window.confirm('Are you sure you want to delete this element? This action cannot be undone.')) {
      await Orchard.prune(`${elementUrl}`)
      dispatch(removeElement(position))
    }
  }
}

// PAGE
//
export type AddPageAction = { type: 'ADD_PAGE', data: Page }
function addPage (data: Page): AddPageAction {
  return { type: 'ADD_PAGE', data }
}

export function createPage (caseSlug: string): ThunkAction {
  return async (dispatch: Dispatch) => {
    const data: Page = await Orchard.graft(
      `cases/${caseSlug}/pages`,
      {}
    )
    dispatch(addPage(data))
  }
}

export type UpdatePageAction = { type: 'UPDATE_PAGE', id: string, data: Object }
export function updatePage (id: string, data: Object): UpdatePageAction {
  setUnsaved()
  return { type: 'UPDATE_PAGE', id, data }
}

// PODCAST
//
export type AddPodcastAction = { type: 'ADD_PODCAST', data: Podcast }
function addPodcast (data: Podcast): AddPodcastAction {
  return { type: 'ADD_PODCAST', data }
}

export function createPodcast (caseSlug: string) {
  return async (dispatch: Dispatch) => {
    const data = (await Orchard.graft(
      `cases/${caseSlug}/podcasts`,
      {}
    ): Podcast)
    dispatch(addPodcast(data))
  }
}

export type UpdatePodcastAction = {
  type: 'UPDATE_PODCAST',
  id: string,
  data: Object,
}
export function updatePodcast (id: string, data: Object): UpdatePodcastAction {
  setUnsaved()
  return { type: 'UPDATE_PODCAST', id, data }
}

// ACTIVITY
//
export type AddActivityAction = { type: 'ADD_ACTIVITY', data: Activity }
function addActivity (data: Activity): AddActivityAction {
  return { type: 'ADD_ACTIVITY', data }
}

export function createActivity (caseSlug: string) {
  return async (dispatch: Dispatch) => {
    const data = (await Orchard.graft(
      `cases/${caseSlug}/activities`,
      {}
    ): Activity)
    dispatch(addActivity(data))
  }
}

export type UpdateActivityAction = {
  type: 'UPDATE_ACTIVITY',
  id: string,
  data: Object
}
export function updateActivity (
  id: string,
  data: Object
): UpdateActivityAction {
  setUnsaved()
  return { type: 'UPDATE_ACTIVITY', id, data }
}

// CARD
//
export type ParseAllCardsAction = { type: 'PARSE_ALL_CARDS' }
export function parseAllCards (): ParseAllCardsAction {
  return { type: 'PARSE_ALL_CARDS' }
}

export type UpdateCardContentsAction = {
  type: 'UPDATE_CARD_CONTENTS',
  id: string,
  editorState: EditorState,
}
export function updateCardContents (
  id: string,
  editorState: EditorState,
): UpdateCardContentsAction {
  setUnsaved()
  return { type: 'UPDATE_CARD_CONTENTS', id, editorState }
}

export type ReplaceCardAction = {
  type: 'REPLACE_CARD',
  cardId: string,
  newCard: Card,
}
export function replaceCard (cardId: string, newCard: Card): ReplaceCardAction {
  return { type: 'REPLACE_CARD', cardId, newCard }
}

export type OpenCitationAction = {
  type: 'OPEN_CITATION',
  data: {
    key: string,
    labelRef: HTMLElement,
  },
}
export function openCitation (
  key: string,
  labelRef: HTMLElement
): OpenCitationAction {
  return { type: 'OPEN_CITATION', data: { key, labelRef }}
}

// SELECTION
//
export type AcceptSelectionAction = {
  type: 'ACCEPT_SELECTION',
  enabled: boolean,
}

export function acceptSelection (
  enabled: boolean = true
): AcceptSelectionAction {
  clearSelection()
  return { type: 'ACCEPT_SELECTION', enabled }
}

type OldDocument = { selection: { empty: () => void } }
function clearSelection (): void {
  if (document.selection) {
    ((document: any): OldDocument).selection.empty()
  } else if (window.getSelection) {
    window.getSelection().removeAllRanges()
  }
}

export type ApplySelectionAction = {
  type: 'APPLY_SELECTION',
  cardId: string,
  selectionState: SelectionState,
}
export function applySelection (
  cardId: string,
  selectionState: SelectionState,
): ApplySelectionAction {
  return { type: 'APPLY_SELECTION', cardId, selectionState }
}

// COMMENT THREAD
//
export function createCommentThread (
  cardId: string,
  editorState: EditorState,
): ThunkAction {
  return async (dispatch: Dispatch) => {
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
    return newCommentThread.id
  }
}

export type AddCommentThreadAction = {
  type: 'ADD_COMMENT_THREAD',
  data: CommentThread,
}
export function addCommentThread (data: CommentThread): AddCommentThreadAction {
  return { type: 'ADD_COMMENT_THREAD', data }
}

export function deleteCommentThread (
  threadId: string,
  cardId: string
): ThunkAction {
  return async (dispatch: Dispatch) => {
    await Orchard.prune(`comment_threads/${threadId}`)
    dispatch(removeCommentThread(threadId, cardId))
  }
}

export type RemoveCommentThreadAction = {
  type: 'REMOVE_COMMENT_THREAD',
  threadId: string,
  cardId: string,
}
function removeCommentThread (
  threadId: string,
  cardId: string
): RemoveCommentThreadAction {
  return { type: 'REMOVE_COMMENT_THREAD', threadId, cardId }
}

export type HoverCommentThreadAction = {
  type: 'HOVER_COMMENT_THREAD',
  id: string,
}
export function hoverCommentThread (id: string): HoverCommentThreadAction {
  return { type: 'HOVER_COMMENT_THREAD', id }
}

// COMMENT
//
export type ChangeCommentInProgressAction = {
  type: 'CHANGE_COMMENT_IN_PROGRESS',
  threadId: string,
  content: string,
}
export function changeCommentInProgress (
  threadId: string,
  content: string
): ChangeCommentInProgressAction {
  return { type: 'CHANGE_COMMENT_IN_PROGRESS', threadId, content }
}

export type AddCommentAction = { type: 'ADD_COMMENT', data: Comment }
export function addComment (data: Comment): AddCommentAction {
  return { type: 'ADD_COMMENT', data }
}

export function createComment (threadId: string, content: string): ThunkAction {
  return (dispatch: Dispatch) => {
    Orchard.graft(
      `comment_threads/${threadId}/comments`,
      { comment: { content }},
    ).then(() => {
      dispatch(changeCommentInProgress(threadId, ''))
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
export type CreateEdgenoteAction = {
  type: 'CREATE_EDGENOTE',
  slug: string,
  data: Edgenote,
}
export function createEdgenote (
  slug: string,
  data: Edgenote
): CreateEdgenoteAction {
  return { type: 'CREATE_EDGENOTE', slug, data }
}

export type UpdateEdgenoteAction = {
  type: 'UPDATE_EDGENOTE',
  slug: string,
  data: Object,
}
export function updateEdgenote (
  slug: string,
  data: Object
): UpdateEdgenoteAction {
  setUnsaved()
  return { type: 'UPDATE_EDGENOTE', slug, data }
}

export type HighlightEdgenoteAction = {
  type: 'HIGHLIGHT_EDGENOTE',
  slug: string,
}
export function highlightEdgenote (slug: string): HighlightEdgenoteAction {
  return { type: 'HIGHLIGHT_EDGENOTE', slug }
}

export type ActivateEdgenoteAction = { type: 'ACTIVATE_EDGENOTE', slug: string }
export function activateEdgenote (slug: string): ActivateEdgenoteAction {
  return { type: 'ACTIVATE_EDGENOTE', slug }
}

// TOASTS
//
export type RegisterToasterAction = { type: 'REGISTER_TOASTER', toaster: any }
export function registerToaster (toaster: any): RegisterToasterAction {
  return { type: 'REGISTER_TOASTER', toaster }
}
export type DisplayToastAction = { type: 'DISPLAY_TOAST', options: Object }
export function displayToast (options: Object): DisplayToastAction {
  return { type: 'DISPLAY_TOAST', options }
}

export type HandleNotificationAction = {
  type: 'HANDLE_NOTIFICATION',
  notification: Notification
}
export function handleNotification (notification: Notification): ThunkAction {
  return (dispatch: Dispatch) => {
    dispatch(displayToast({
      message: notification.message,
      intent: Intent.PRIMARY,
      action: {
        href: `/cases/${notification.case.slug}/${notification.element.position}/cards/${notification.cardId}/comments/${notification.commentThreadId}`,
        text: 'Read',
      },
    }))
  }
}
