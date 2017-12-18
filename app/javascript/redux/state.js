/**
 * @flow
 */

import type { EditorState } from 'draft-js'
import type { RawDraftContentState } from 'draft-js/lib/RawDraftContentState'

// eslint-disable-next-line no-unused-vars
type _ExtractReturn<B, F: (...args: any[]) => B> = B
export type ExtractReturn<F> = _ExtractReturn<*, F>

// Redux state
export type State = {
  caseData: CaseDataState,
  edgenotesBySlug: EdgenotesState,
  pagesById: PagesState,
  podcastsById: PodcastsState,
  activitiesById: ActivitiesState,
  cardsById: CardsState,
  commentThreadsById: CommentThreadsState,
  commentsById: CommentsState,
  communities: CommunitiesState[],
  statistics: StatisticsState,
  quiz: QuizState,
  edit: EditState,
  ui: UIState,
}

export type ActivitiesState = {
  [activityId: string]: Activity,
}

export type CardsState = {
  [cardSlug: string]: Card,
}

export type CaseDataState = Case & { reader?: ReaderState }

export type CommentThreadsState = {
  [commentThreadId: string]: CommentThread,
}

export type CommentsState = {
  [commentId: string]: Comment,
}

export type CommunitiesState = Community[]

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

export type QuizState = QuizNecessity<boolean, boolean> & {
  id?: string,
  questions?: Question[],
}

export type ReaderState = {
  canUpdateCase: boolean,
  enrollment: ?{
    status: 'student' | 'instructor' | 'treatment',
  },
} & Reader

export type StatisticsState =
  | false
  | {
      [trackableUri: string]: Statistics,
    }

export type UIState = {
  acceptingSelection: boolean,
  activeEdgenote: ?string,
  commentInProgress: {
    [commentThreadId: string]: EditorState,
  },
  highlightedEdgenote: ?string,
  hoveredCommentThread: ?string,
  mostRecentCommentThreads: ?(string[]),
  openedCitation: Citation,
  toaster: any,
}

// Model Objects
export type Element = Activity | Page | Podcast

export type Activity = {
  cardId: number,
  caseElement: CaseElement,
  iconSlug: string,
  id: string,
  pdfUrl: string,
  position: number,
  title: string,
  url: string,
}

export type Byline = {
  authors: string[],
  authorsString: string,
  translators: string[],
  translatorsString: string,
  acknowledgements: string,
}

export type Card = {
  commentThreads: ?(CommentThread[]),
  editorState: ?EditorState,
  id: string,
  pageId: string,
  position: number,
  rawContent: RawDraftContentState,
  solid: boolean,
}

export type Case = {
  acknowledgements: string,
  audience: string,
  baseCoverUrl: string,
  caseElements: CaseElement[],
  commentable: boolean,
  coverUrl: string,
  dek: string,
  featuredAt: ?Date,
  kicker: string,
  latitude: ?number,
  learningObjectives: string[],
  library: Library,
  longitude: ?number,
  otherAvailableLocales: string[],
  photoCredit: string,
  publishedAt: ?Date,
  slug: string,
  smallCoverUrl: string,
  summary: string,
  title: string,
  url: string,
  zoom: ?number,
} & Byline

export type CaseElement = {
  caseId: string,
  elementId: string,
  elementStore: CaseElementStore,
  elementType: string,
  id: string,
  position: number,
}

export type CaseElementStore = 'pagesById' | 'podcastsById' | 'activitiesById'

export type Citation =
  | {| +key: null, +labelRef: null |}
  | {|
      +key: string,
      +labelRef: HTMLElement,
    |}

export type Comment = {
  commentThreadId: number,
  content: string,
  id: string,
  reader: {
    id: string,
    initials: string,
    name: string,
    imageUrl: ?string,
    hashKey: string,
  },
  timestamp: string,
}

export type CommentThread = {
  blockIndex: number,
  cardId: string,
  commentIds: string[],
  commentsCount: number,
  id: string,
  length: number,
  originalHighlightText: string,
  readerId: number,
  readers: { imageUrl: ?string, hashKey: string, name: string }[],
  start: number,
}

export type Community = {
  id: string | null,
  name: string,
  active: boolean,
  global: boolean,
}

export type Edgenote = {
  attribution: string,
  altText: string,
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

export type Enrollment = {
  id: string,
  status: 'student' | 'instructor' | 'treatment',
  caseSlug: string,
}

export type Library = {
  slug: string,
  name: string,
  description: string,
  url: string,
  logoUrl: string,
  backgroundColor: string,
  foregroundColor: string,
}

export type Notification = {
  id: string,
  message: string,
} & ReplyToThreadNotification

export type Page = {
  cards: string[],
  caseElement: CaseElement,
  iconSlug: void,
  id: string,
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
  id: string,
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
  correctAnswer?: string,
}

export type Reader = {
  activeCommunity: ?Community,
  email: string,
  hashKey: string,
  id: string,
  imageUrl: ?string,
  initials: string,
  name: string,
  roles: {
    editor: boolean,
    invisible: boolean,
  },
}

export type ReplyToThreadNotification = {
  notifier: {
    // instance of Reader
    id: string,
    name: string,
    initials: string,
  },
  community: {
    id: string,
    name: string,
  },
  case: {
    slug: string,
    kicker: string,
  },
  element: {
    position: number,
  },
  cardId: string,
  commentThreadId: number,
}

export type Statistics = ({ loaded: true } & StatisticsData) | { loaded: false }

export type StatisticsData = {
  averageTime: string,
  uniques: number,
  views: number,
  updatedAt: number,
}

export type Viewport = { latitude: number, longitude: number, zoom: number }
