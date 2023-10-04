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
  cardsById: CardsState,
  caseData: CaseDataState,
  commentsById: CommentsState,
  commentThreadsById: CommentThreadsState,
  edgenotesBySlug: EdgenotesState,
  edit: EditState,
  forums: ForumsState,
  locks: LocksState,
  pagesById: PagesState,
  podcastsById: PodcastsState,
  quiz: QuizState,
  statistics: StatisticsState,
  suggestedQuizzes: SuggestedQuizzesState,
  ui: UIState,
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

export type EdgenotesState = {
  [edgenoteSlug: string]: Edgenote,
}

export type EditState = {
  changed: boolean,
  inProgress: boolean,
  locksToDelete: string[],
  possible: boolean,
  unsavedChanges: {
    [modelSlashId: string]: boolean,
  },
}

export type ForumsState = Forum[]

export type LocksState = {
  [gid: string]: Lock,
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

export type QuizState = QuizNecessity<boolean, boolean> & $Shape<Quiz>

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

export type SuggestedQuizzesState = {
  [id: string]: SuggestedQuiz,
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
}

// Model Objects
export type Element = Page | Podcast

export type Announcement = {
  param: string,
  content: string,
  url: string,
}

export type Author = { name: string, institution: string }

export type Byline = {
  authors: Author[],
  translators: string[],
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
  licenseConfig: LicenseConfig,
  links: {
    archive: string,
    newEditorship: string,
    newTranslation: string,
    self: string,
    settings: string,
    taggings: string,
    teach: string,
    teachingGuide: string,
    newCopy: string
  },
  longitude: ?number,
  otherAvailableLocales: { [string]: { link: string, name: string } },
  photoCredit: string,
  publishedAt: ?Date,
  slug: string,
  smallCoverUrl: string,
  summary: string,
  tags: Tag[],
  teachingGuideUrl: ?string,
  title: string,
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

export type CaseElementStore = 'pagesById' | 'podcastsById'

export type Citation =
  | {| +key: null, +labelRef: null |}
  | {|
      +key: string,
      +labelRef: HTMLElement,
    |}

export type Comment = {
  attachments: {
    name: string,
    url: string,
    representable: boolean,
    size?: {
      width: number,
      height: number,
    },
  }[],
  commentThreadId: number,
  content: string,
  edited: boolean,
  id: string,
  reader: {
    id: string,
    initials: string,
    name: string,
    imageUrl: ?string,
    hashKey: string,
  },
  timestamp: string,
  updatedAt: string,
}

export type CommentThread = {
  blockIndex: ?number,
  cardId: ?string,
  commentIds: string[],
  commentsCount: number,
  id: string,
  length: number,
  originalHighlightText: ?string,
  readerId: number,
  readers: { imageUrl: ?string, hashKey: string, name: string }[],
  start: ?number,
}

export type Community = {
  param: string | null,
  name: string,
  description: string,
  active: boolean,
  global: boolean,
}

export type DraftQuestion = {
  id: ?string,
  content: string,
  options: string[],
  correctAnswer: string,
  hasError?: boolean,
}

export type Edgenote = {
  attribution: string,
  altText: string,
  audioUrl: string,
  callToAction: string,
  caption: string,
  content: string,
  embedCode: string,
  fileUrl: string,
  format: string,
  layout: string,
  iconSlug: ?string,
  imageUrl: string,
  imageThumbnailUrl: string,
  instructions: string,
  links: {
    audio: string,
    file: string,
    image: string,
    self: string,
  },
  pdfUrl: string,
  photoCredit: string,
  pullQuote: string,
  slug: string,
  style: 'v1' | 'v2',
  thumbnailUrl: string,
  updatedAt: Date,
  websiteUrl: string,
}

export type Enrollment = {
  id: string,
  status: 'student' | 'instructor' | 'treatment',
  caseSlug: string,
}

export type Forum = {
  param: string,
  moderateable: boolean,
  community: Community,
}

export type Library = {
  slug: string,
  name: string,
  description: string,
  url: string,
  logoUrl: string,
  backgroundColor: string,
  foregroundColor: string,
  links: {
    self: string,
  },
}

export type LicenseConfig = {
  id: string,
  name: string,
  active: boolean,
  url: string,
}

export type LinkExpansionVisibility = {
  noEmbed?: boolean,
  noDescription?: boolean,
  noImage?: boolean,
}

export type Lock = {
  caseSlug: string,
  createdAt: Date,
  lockable: { type: string, table: string, param: string },
  param: string,
  reader: {
    hashKey: string,
    imageUrl: string,
    name: string,
    param: string,
  },
}

export type Notification = {
  id: string,
  message: string,
} & ReplyToThreadNotification

export type Page = {
  cards: string[],
  caseElement: CaseElement,
  iconSlug: ?string,
  id: string,
  position: number,
  title: string,
  url: string,
}

export type Persona = 'learner' | 'teacher' | 'writer'

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
  correctAnswer: string,
}

export type Quiz = {
  id: string,
  questions: Question[],
}

export type Reader = {
  activeCommunity: ?Community,
  anyDeployments: boolean,
  anyEditorships: boolean,
  email: string,
  hashKey: string,
  id: string,
  imageUrl: ?string,
  initials: string,
  name: string,
  persona: Persona,
  roles: {
    editor: boolean,
    invisible: boolean,
  },
}

export type ReadingList = {
  caseSlugs: string[],
  description: string,
  links: {
    self: string,
  },
  param: string,
  title: string,
}

export type ReadingListItem = {
  caseSlug: string,
  notes: string,
  param: string,
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

export type SuggestedQuiz = {
  param: string,
  questions: DraftQuestion[],
  title: string,
}

export type Tag = {
  category?: boolean,
  displayName: string,
  name: string,
}

export type Viewport = { latitude: number, longitude: number, zoom: number }
