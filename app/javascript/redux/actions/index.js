/**
 * @flow
 */

import type { State } from 'redux/state'

import * as ActivityActions from './activity.js'
import * as CardActions from './card.js'
import * as CaseActions from './case.js'
import * as CaseElementActions from './caseElement.js'
import * as CommentActions from './comment.js'
import * as CommentThreadActions from './commentThread.js'
import * as CommunityActions from './community.js'
import * as EdgenoteActions from './edgenote.js'
import * as EditingActions from './editing.js'
import * as PageActions from './page.js'
import * as PodcastActions from './podcast.js'
import * as QuizActions from './quiz.js'
import * as SelectionActions from './selection.js'
import * as StatisticsActions from './statistics.js'
import * as ToastActions from './toast.js'

export * from './activity.js'
export * from './card.js'
export * from './case.js'
export * from './caseElement.js'
export * from './comment.js'
export * from './commentThread.js'
export * from './community.js'
export * from './edgenote.js'
export * from './editing.js'
export * from './page.js'
export * from './podcast.js'
export * from './quiz.js'
export * from './selection.js'
export * from './statistics.js'
export * from './toast.js'

export type GetState = () => State
export type PromiseAction = Promise<Action>
export type ThunkAction = (dispatch: Dispatch, getState: GetState) => any
export type Dispatch = (
  action: Action | ThunkAction | PromiseAction | Array<Action>
) => Promise<any>

export type Action =
  | ActivityActions.AddActivityAction
  | ActivityActions.UpdateActivityAction
  | CardActions.AddCardAction
  | CardActions.OpenCitationAction
  | CardActions.ParseAllCardsAction
  | CardActions.RemoveCardAction
  | CardActions.ReplaceCardAction
  | CardActions.SetCardsAction
  | CardActions.UpdateCardContentsAction
  | CaseActions.SetReaderEnrollmentAction
  | CaseActions.UpdateCaseAction
  | CaseElementActions.RemoveElementAction
  | CaseElementActions.UpdateCaseElementAction
  | CaseElementActions.UpdateCaseElementsAction
  | CommentActions.AddCommentAction
  | CommentActions.ChangeCommentInProgressAction
  | CommentActions.RemoveCommentAction
  | CommentActions.SetCommentsByIdAction
  | CommentThreadActions.AddCommentThreadAction
  | CommentThreadActions.HoverCommentThreadAction
  | CommentThreadActions.RemoveCommentThreadAction
  | CommentThreadActions.SetCommentThreadsByIdAction
  | CommentThreadActions.SetMostRecentCommentThreadsAction
  | CommunityActions.SetCommunitiesAction
  | EdgenoteActions.ActivateEdgenoteAction
  | EdgenoteActions.AddEdgenoteAction
  | EdgenoteActions.HighlightEdgenoteAction
  | EdgenoteActions.RemoveEdgenoteAction
  | EdgenoteActions.UpdateEdgenoteAction
  | EditingActions.ClearUnsavedAction
  | EditingActions.ToggleEditingAction
  | PageActions.AddPageAction
  | PageActions.UpdatePageAction
  | PodcastActions.AddPodcastAction
  | PodcastActions.UpdatePodcastAction
  | QuizActions.RecordQuizSubmissionAction
  | SelectionActions.AcceptSelectionAction
  | SelectionActions.ApplySelectionAction
  | StatisticsActions.SetStatisticsAction
  | ToastActions.DisplayToastAction
  | ToastActions.RegisterToasterAction
