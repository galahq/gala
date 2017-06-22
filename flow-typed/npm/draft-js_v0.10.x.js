// flow-typed signature: e497ee64d64e595ae08ceae32c4ea488
// flow-typed version: <<STUB>>/draft-js_v0.10/flow_v0.38.0

import type { List, Map, OrderedMap, Record } from 'immutable'

declare module 'draft-js' {
  declare export function convertFromHTML(
    string
  ): ?{
    contentBlocks: Array<ContentBlock>,
    entityMap: { [string]: DraftEntity },
  }

  declare export function convertFromRaw(RawDraftContentState): ContentState
  declare export function convertToRaw(ContentState): RawDraftContentState

  declare export class CharacterMetadata {
    getEntity(): string,
    hasStyle(string): boolean,
  }

  declare export class CompositeDecorator {
    constructor(
      Array<{
        strategy: (
          ContentBlock,
          (number, number) => void,
          ContentState
        ) => void,
        component: Function,
      }>
    ): DraftDecoratorType,
  }

  declare export class ContentState {
    static createFromBlockArray(ContentBlock[], Map): ContentState,
    createEntity(string, string, Object): ContentState,
    getBlockMap(): ContentBlock[],
    getBlocksAsArray(): ContentBlock[],
    getEntity(string): DraftEntity,
    getLastCreatedEntityKey(): string,
    set(string, mixed): ContentState,
  }

  declare export class ContentBlock {
    findEntityRanges(
      (CharacterMetadata) => boolean,
      (number, number) => void
    ): void,
    findStyleRanges(
      (CharacterMetadata) => boolean,
      (number, number) => void
    ): void,
    getDepth(): number,
    getKey(): string,
    getText(): string,
    set(string, mixed): ContentBlock,
  }

  declare export var DefaultDraftBlockRenderMap: Map

  declare export type DraftDecoratorType = {
    getDecorations: (
      block: ContentBlock,
      contentState: ContentState
    ) => List<?string>,
    getComponentForKey: (key: string) => Function,
    getPropsForKey: (key: string) => ?Object,
  }

  declare export class DraftEntity {
    getData(): Object,
    getType(): string,
  }

  declare export class DraftInlineStyle {
    has(string): boolean,
  }

  declare export class Editor<D, P, S> extends React$Component<D, P, S> {}

  declare export class EditorState {
    static create(config: Object): EditorState,
    static createEmpty(decorator?: ?DraftDecoratorType): EditorState,
    static createWithContent(
      contentState: ContentState,
      decorator?: ?DraftDecoratorType
    ): EditorState,
    static forceSelection(EditorState, SelectionState): EditorState,
    static push(EditorState, ContentState, string): EditorState,
    static set(editorState: EditorState, put: Object): EditorState,
    getCurrentContent(): ContentState,
    getCurrentInlineStyle(): DraftInlineStyle,
    getSelection(): SelectionState,
    toJS(): Object,
  }

  declare export class Modifier {
    static applyEntity(ContentState, SelectionState, string): ContentState,
    static insertText(ContentState, SelectionState, string): ContentState,
  }

  declare export type RawDraftContentState = Object

  declare export class RichUtils {
    static handleKeyCommand(
      editorState: EditorState,
      command: string
    ): ?EditorState,
    static toggleBlockType(EditorState, string): EditorState,
    static toggleInlineStyle(EditorState, string): EditorState,
  }

  declare export class SelectionState {
    anchorKey: string,
    anchorOffset: number,
    focusKey: string,
    focusOffset: number,
    isBackward: boolean,
    hasFocus: boolean,
    serialize(): string,
    getAnchorKey(): string,
    getAnchorOffset(): number,
    getFocusKey(): string,
    getFocusOffset(): number,
    getIsBackward(): boolean,
    getHasFocus(): boolean,
    hasEdgeWithin(blockKey: string, start: number, end: number): boolean,
    isCollapsed(): boolean,
    getStartKey(): string,
    getStartOffset(): number,
    getEndKey(): string,
    getEndOffset(): number,
    static createEmpty(key: string): SelectionState,
  }
}
