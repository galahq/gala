/* @flow */

import type { EditorState } from 'draft-js'

// Redux state
export type State = {
  activitiesById: ActivitiesState,
  cardsById: CardsState,
  caseData: CaseDataState,
  commentThreadsById: CommentThreadsState,
  commentsById: CommentsState,
  edgenotesBySlug: EdgenotesState,
  edit: EditState,
  pagesById: PagesState,
  podcastsById: PodcastsState,
  quiz: QuizState,
  statistics: StatisticsState,
  ui: UIState,
}

export type ActivitiesState = {
  [activityId: string]: Activity,
}

export type CardsState = {
  [cardSlug: string]: Card,
}

export type CaseDataState = {
  baseCoverUrl: string,
  caseAuthors: string,
  caseElements: CaseElement[],
  commentable: boolean,
  coverUrl: string,
  dek: string,
  kicker: string,
  otherAvailableLocales: string[],
  pageIds: number[],
  photoCredit: string,
  published: boolean,
  reader: ?Reader,
  slug: string,
  smallCoverUrl: string,
  summary: string,
  title: string,
  translators: string,
}

export type CommentThreadsState = {
  [commentThreadId: string]: CommentThread,
}

export type CommentsState = {
  [commentId: string]: Comment,
}

export type EdgenotesState = {
  [edgenoteSlug: string]: Edgenote,
}

export type EditState = {
  changed: boolean,
  inProgress: boolean,
  possible: boolean,
  unsavedChanges: {
    [modelSlashId: string]: boolean,
  },
}

export type PagesState = {
  [pageId: string]: Page,
}

export type PodcastsState = {
  [podcastId: string]: Podcast,
}

export type QuizNecessity<Pre: boolean, Post: boolean> = {
  needsPretest: Pre,
  needsPosttest: Post,
}

export type QuizState =
  | QuizNecessity<false, false>
  | (QuizNecessity<boolean, boolean> & {
      id: number,
      questions: Question[],
    })

export type StatisticsState =
  | false
  | {
      [trackableUri: string]: Statistics,
    }

export type UIState = {
  acceptingSelection: boolean,
  activeEdgenote: ?string,
  commentInProgress: {
    [commentThreadId: string]: string,
  },
  highlightedEdgenote: ?string,
  hoveredCommentThread: ?string,
  openedCitation: {
    key?: string,
    labelRef?: any,
  },
  toaster: any,
}

// Model Objects
export type Element = Activity | Page | Podcast

export type Activity = {
  cardId: number,
  caseElement: CaseElement,
  iconSlug: string,
  id: number,
  pdfUrl: string,
  position: number,
  title: string,
  url: string,
}

export type Card = {
  commentThreads: CommentThread[],
  content: string,
  editorState: EditorState,
  id: string,
  position: number,
  rawContent: string,
  solid: boolean,
}

export type CaseElement = {
  caseId: number,
  elementId: string,
  elementStore: CaseElementStore,
  elementType: string,
  id: string,
  position: number,
}

export type CaseElementStore = 'pagesById' | 'podcastsById' | 'activitiesById'

export type Comment = {
  commentThreadId: number,
  content: string,
  id: number,
  reader: {
    id: number,
    initials: string,
    name: string,
  },
  timestamp: string,
}

export type CommentThread = {
  blockIndex: number,
  cardId: string,
  commentIds: number[],
  id: string,
  length: number,
  originalHighlightText: string,
  readerId: number,
  start: number,
}

export type Edgenote = {
  attribution: string,
  audioUrl: string,
  averageTime: string,
  callToAction: string,
  caption: string,
  content: string,
  embedCode: string,
  format: string,
  imageUrl: string,
  instructions: string,
  pdfUrl: string,
  photoCredit: string,
  pullQuote: string,
  slug: string,
  style: 'v1' | 'v2',
  thumbnailUrl: string,
  uniques: number,
  views: number,
  websiteUrl: string,
  youtubeSlug: string,
}

export type ReplyToThreadNotification = {
  notifier: {
    id: number,
    name: string,
    initials: string,
  },
  case: {
    slug: string,
    kicker: string,
  },
  element: {
    position: number,
  },
  cardId: number,
  commentThreadId: number,
}

export type Notification = {
  id: number,
  message: string,
} & ReplyToThreadNotification

export type Page = {
  cards: number[],
  caseElement: CaseElement,
  iconSlug: void,
  id: number,
  position: number,
  title: string,
  url: string,
}

export type Podcast = {
  artworkUrl: string,
  audioUrl: string,
  averageTime: string,
  cardId: number,
  caseElement: CaseElement,
  creditsList: PodcastCreditList,
  iconSlug: string,
  id: number,
  photoCredit: string,
  position: number,
  title: string,
  uniques: number,
  url: string,
  views: number,
}

export type PodcastCreditList = {
  guests: PodcastGuest[],
  hosts: string[],
  hosts_string: string,
}

export type PodcastGuest = { name: string, title: string }

export type Question = {
  id: string,
  content: string,
  options: string[],
}

export type Reader = {
  canUpdateCase: boolean,
  email: string,
  enrollment: ?{
    status: 'student' | 'instructor' | 'treatment',
  },
  id: number,
  initials: string,
  name: string,
  roles: {
    editor: boolean,
    invisible: boolean,
  },
}

export type Statistics = ({ loaded: true } & StatisticsData) | { loaded: false }

export type StatisticsData = {
  averageTime: string,
  uniques: number,
  views: number,
  updatedAt: number,
}
