/**
 * @flow
 */

import { batchActions } from 'redux-batched-actions'

import { Orchard } from 'shared/orchard'
import { convertToRaw } from 'draft-js'
import { Intent } from '@blueprintjs/core'

import { EditorState } from 'draft-js'
import type { SelectionState } from 'draft-js'
import type { Toaster, Toast } from '@blueprintjs/core'

import type {
  State,
  CaseDataState,
  CaseElement,
  Card,
  CardsState,
  Page,
  Podcast,
  Activity,
  Comment,
  CommentsState,
  CommentThread,
  CommentThreadsState,
  Community,
  Edgenote,
  QuizNecessity,
  Notification,
  StatisticsData,
} from 'redux/state'

export type Action =
  | ToggleEditingAction
  | ClearUnsavedAction
  | UpdateCaseAction
  | SetReaderEnrollmentAction
  | UpdateCaseElementAction
  | UpdateCaseElementsAction
  | RemoveElementAction
  | AddPageAction
  | UpdatePageAction
  | AddPodcastAction
  | UpdatePodcastAction
  | AddActivityAction
  | UpdateActivityAction
  | ParseAllCardsAction
  | UpdateCardContentsAction
  | ReplaceCardAction
  | OpenCitationAction
  | AcceptSelectionAction
  | ApplySelectionAction
  | AddCommentThreadAction
  | RemoveCommentThreadAction
  | HoverCommentThreadAction
  | ChangeCommentInProgressAction
  | AddCommentAction
  | CreateEdgenoteAction
  | UpdateEdgenoteAction
  | HighlightEdgenoteAction
  | ActivateEdgenoteAction
  | RegisterToasterAction
  | RecordQuizSubmissionAction
  | SetStatisticsAction
  | DisplayToastAction
  | SetCardsAction
  | SetCommentsByIdAction
  | SetCommentThreadsByIdAction
  | SetCommunitiesAction

type GetState = () => State
type PromiseAction = Promise<Action>
type ThunkAction = (dispatch: Dispatch, getState: GetState) => any
export type Dispatch = (
  action: Action | ThunkAction | PromiseAction | Array<Action>
) => Promise<any>

// API

export type ToggleEditingAction = { type: 'TOGGLE_EDITING' }
export function toggleEditing (): ToggleEditingAction {
  return { type: 'TOGGLE_EDITING' }
}

export function saveChanges (): ThunkAction {
  return (dispatch: Dispatch, getState: GetState) => {
    const state = getState()

    dispatch(clearUnsaved())
    dispatch(
      displayToast({
        message: 'Saved successfully',
        intent: Intent.SUCCESS,
      })
    )
    window.onbeforeunload = null

    Object.keys(state.edit.unsavedChanges).forEach(endpoint => {
      saveModel(
        endpoint === 'caseData' ? `cases/${state.caseData.slug}` : endpoint,
        state
      )
    })
  }
}

async function saveModel (endpoint: string, state: State): Promise<Object> {
  const [model, id] = endpoint.split('/')

  let data
  switch (model) {
    case 'cases':
      {
        const {
          published,
          kicker,
          title,
          dek,
          slug,
          photoCredit,
          summary,
          baseCoverUrl,
          learningObjectives,
          authors,
          translators,
        } = state.caseData
        data = {
          case: {
            published,
            kicker,
            title,
            dek,
            slug,
            photoCredit,
            summary,
            learningObjectives,
            authors,
            translators,
            coverUrl: baseCoverUrl,
          },
        }
      }
      break

    case 'cards':
      {
        const editorState =
          state.cardsById[id].editorState || EditorState.createEmpty()
        data = {
          card: {
            rawContent: JSON.stringify(
              convertToRaw(editorState.getCurrentContent())
            ),
          },
        }
      }
      break

    case 'pages':
      {
        const { title, position } = state.pagesById[id]
        data = {
          page: {
            title,
            position,
          },
        }
      }
      break

    case 'podcasts':
      {
        const {
          creditsList,
          title,
          artworkUrl,
          audioUrl,
          photoCredit,
        } = state.podcastsById[id]
        data = {
          podcast: {
            creditsList,
            title,
            artworkUrl,
            audioUrl,
            photoCredit,
          },
        }
      }
      break

    case 'activities':
      {
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
  window.onbeforeunload = () =>
    'You have unsaved changes. Are you sure you ' + 'want to leave?'
}

export type ClearUnsavedAction = { type: 'CLEAR_UNSAVED' }
function clearUnsaved (): ClearUnsavedAction {
  return { type: 'CLEAR_UNSAVED' }
}

// CASE
//
export type UpdateCaseAction = {
  type: 'UPDATE_CASE',
  data: $Shape<CaseDataState>,
}
export function updateCase (
  slug: string,
  data: $Shape<CaseDataState>
): UpdateCaseAction {
  setUnsaved()
  return { type: 'UPDATE_CASE', data }
}

export function enrollReader (readerId: string, caseSlug: string): ThunkAction {
  return async (dispatch: Dispatch) => {
    const enrollment = await Orchard.espalier(
      `admin/cases/${caseSlug}/readers/${readerId}/enrollments/upsert`
    )
    dispatch(setReaderEnrollment(!!enrollment))
    dispatch(fetchCommentThreads(caseSlug))
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
  index: number
): UpdateCaseElementAction {
  return { type: 'UPDATE_CASE_ELEMENT', id, index }
}

export type UpdateCaseElementsAction = {
  type: 'UPDATE_CASE_ELEMENTS',
  data: { caseElements: CaseElement[] },
}
function updateCaseElements (data: {
  caseElements: CaseElement[],
}): UpdateCaseElementsAction {
  return { type: 'UPDATE_CASE_ELEMENTS', data }
}
export function persistCaseElementReordering (
  id: string,
  index: number
): ThunkAction {
  return async (dispatch: Dispatch) => {
    const caseElements = (await Orchard.espalier(`case_elements/${id}`, {
      case_element: { position: index + 1 },
    }): CaseElement[])
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
    if (
      window.confirm(
        'Are you sure you want to delete this element? This action cannot be undone.'
      )
    ) {
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
    const data: Page = await Orchard.graft(`cases/${caseSlug}/pages`, {})
    dispatch(addPage(data))
  }
}

export type UpdatePageAction = {
  type: 'UPDATE_PAGE',
  id: string,
  data: $Shape<Page>,
}
export function updatePage (id: string, data: $Shape<Page>): UpdatePageAction {
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
  data: $Shape<Podcast>,
}
export function updatePodcast (
  id: string,
  data: $Shape<Podcast>
): UpdatePodcastAction {
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
  data: $Shape<Activity>,
}
export function updateActivity (
  id: string,
  data: $Shape<Activity>
): UpdateActivityAction {
  setUnsaved()
  return { type: 'UPDATE_ACTIVITY', id, data }
}

// CARD
//
export type SetCardsAction = { type: 'SET_CARDS', cards: CardsState }
export function setCards (cards: CardsState): SetCardsAction {
  return { type: 'SET_CARDS', cards }
}

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
  editorState: EditorState
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
  data: | {| key: null |}
    | {|
        key: string,
        labelRef: HTMLElement,
      |},
}
export function openCitation (
  key: string | null,
  labelRef?: HTMLElement
): OpenCitationAction {
  if (key != null && labelRef != null) {
    return { type: 'OPEN_CITATION', data: { key, labelRef }}
  } else if (key == null) {
    return { type: 'OPEN_CITATION', data: { key }}
  } else {
    throw new Error('Should never happen')
  }
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
    ;((document: any): OldDocument).selection.empty()
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
  selectionState: SelectionState
): ApplySelectionAction {
  return { type: 'APPLY_SELECTION', cardId, selectionState }
}

// COMMUNITY
//
export function fetchCommunities (slug: string): ThunkAction {
  return async (dispatch: Dispatch) => {
    const { communities } = await Orchard.harvest(`cases/${slug}/communities`)
    dispatch(setCommunities(communities))
  }
}

export function updateActiveCommunity (
  slug: string,
  id: string | null
): ThunkAction {
  return async (dispatch: Dispatch) => {
    await Orchard.espalier(`profile`, { reader: { activeCommunityId: id }})
    dispatch(fetchCommunities(slug))
    dispatch(fetchCommentThreads(slug))
    dispatch(resubscribeToActiveForumChannel(slug))
  }
}

export type SetCommunitiesAction = {
  type: 'SET_COMMUNITIES',
  communities: Community[],
}
export function setCommunities (communities: Community[]): SetCommunitiesAction {
  return { type: 'SET_COMMUNITIES', communities }
}

export function subscribeToActiveForumChannel (slug: string): ThunkAction {
  return (dispatch: Dispatch) => {
    App.forum = App.cable.subscriptions.create(
      {
        channel: 'ForumChannel',
        case_slug: slug,
        timestamp: Date.now(), // Timestamp needed for cachebusting
      },
      {
        received: data => {
          if (data.comment) {
            dispatch(addComment(JSON.parse(data.comment)))
          }
          if (data.comment_thread) {
            dispatch(addCommentThread(JSON.parse(data.comment_thread)))
          }
        },
      }
    )
  }
}

export function resubscribeToActiveForumChannel (slug: string): ThunkAction {
  return (dispatch: Dispatch) => {
    if (App.forum == null) return
    App.forum.unsubscribe()
    delete App.forum
    dispatch(subscribeToActiveForumChannel(slug))
  }
}

// COMMENT THREAD
//
export function fetchCommentThreads (slug: string): ThunkAction {
  return async (dispatch: Dispatch) => {
    const { commentThreads, comments, cards } = await Orchard.harvest(
      `cases/${slug}/comment_threads`
    )
    dispatch(
      batchActions([
        setCommentsById(comments),
        setCommentThreadsById(commentThreads),
        setCards(cards),
      ])
    )
    dispatch(parseAllCards())
  }
}

export type SetCommentThreadsByIdAction = {
  type: 'SET_COMMENT_THREADS_BY_ID',
  commentThreadsById: CommentThreadsState,
}
export function setCommentThreadsById (
  commentThreadsById: CommentThreadsState
): SetCommentThreadsByIdAction {
  return { type: 'SET_COMMENT_THREADS_BY_ID', commentThreadsById }
}

export function createCommentThread (
  cardId: string,
  editorState: EditorState
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

    const newCommentThread = (await Orchard.graft(
      `cards/${cardId}/comment_threads`,
      {
        commentThread: { blockIndex, start, length, originalHighlightText },
      }
    ): CommentThread)

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
export type SetCommentsByIdAction = {
  type: 'SET_COMMENTS_BY_ID',
  commentsById: CommentsState,
}
export function setCommentsById (
  commentsById: CommentsState
): SetCommentsByIdAction {
  return { type: 'SET_COMMENTS_BY_ID', commentsById }
}

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
    Orchard.graft(`comment_threads/${threadId}/comments`, {
      comment: { content },
    })
      .then(() => {
        dispatch(changeCommentInProgress(threadId, ''))
      })
      .catch((error: Error) => {
        dispatch(
          displayToast({
            message: `Error saving: ${error.message}`,
            intent: Intent.WARNING,
          })
        )
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
  data: $Shape<Edgenote>,
}
export function updateEdgenote (
  slug: string,
  data: $Shape<Edgenote>
): UpdateEdgenoteAction {
  setUnsaved()
  return { type: 'UPDATE_EDGENOTE', slug, data }
}

export type HighlightEdgenoteAction = {
  type: 'HIGHLIGHT_EDGENOTE',
  slug: string | null,
}
export function highlightEdgenote (
  slug: string | null
): HighlightEdgenoteAction {
  return { type: 'HIGHLIGHT_EDGENOTE', slug }
}

export type ActivateEdgenoteAction = {
  type: 'ACTIVATE_EDGENOTE',
  slug: string | null,
}
export function activateEdgenote (slug: string | null): ActivateEdgenoteAction {
  return { type: 'ACTIVATE_EDGENOTE', slug }
}

// QUIZZES
//
export function submitQuiz (
  id: number,
  answers: { [string]: string }
): ThunkAction {
  return async (dispatch: Dispatch) => {
    const params = {
      answers: Object.keys(answers).map((key: string) => ({
        questionId: key,
        content: answers[key],
      })),
    }
    const necessity = (await Orchard.graft(
      `quizzes/${id}/submissions`,
      params
    ): QuizNecessity<boolean, boolean>)
    dispatch(recordQuizSubmission(necessity))
  }
}

export type RecordQuizSubmissionAction = {
  type: 'RECORD_QUIZ_SUBMISSION',
  data: QuizNecessity<boolean, boolean>,
}
function recordQuizSubmission (
  data: QuizNecessity<boolean, boolean>
): RecordQuizSubmissionAction {
  return { type: 'RECORD_QUIZ_SUBMISSION', data }
}

// STATISTICS
//
export type SetStatisticsAction = {
  type: 'SET_STATISTICS',
  uri: string,
  data: StatisticsData,
}
function setStatistics (uri: string, data: StatisticsData): SetStatisticsAction {
  return { type: 'SET_STATISTICS', uri, data }
}

export function loadStatistics (uri: string): ThunkAction {
  return async (dispatch: Dispatch) => {
    const data = (await Orchard.harvest(`${uri}/statistics`): StatisticsData)
    dispatch(setStatistics(uri, data))
  }
}

// TOASTS
//
export type RegisterToasterAction = { type: 'REGISTER_TOASTER', toaster: any }
export function registerToaster (toaster: Toaster): RegisterToasterAction {
  return { type: 'REGISTER_TOASTER', toaster }
}
export type DisplayToastAction = { type: 'DISPLAY_TOAST', options: Toast }
export function displayToast (options: Toast): DisplayToastAction {
  return { type: 'DISPLAY_TOAST', options }
}

export type HandleNotificationAction = {
  type: 'HANDLE_NOTIFICATION',
  notification: Notification,
}
export function handleNotification (notification: Notification): ThunkAction {
  return (dispatch: Dispatch) => {
    const {
      message,
      case: kase,
      element,
      cardId,
      commentThreadId,
      community,
    } = notification
    dispatch(
      displayToast({
        message,
        intent: Intent.PRIMARY,
        action: {
          onClick: _ => {
            dispatch(
              updateActiveCommunity(kase.slug, community.id)
            ).then(() => {
              window.location = `/cases/${kase.slug}/${element.position}/cards/${cardId}/comments/${commentThreadId}`
            })
          },
          text: 'Read',
        },
      })
    )
  }
}
