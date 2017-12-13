/**
 * @providesModule FormattingToolbar
 * @flow
 */

import * as React from 'react'
import styled from 'styled-components'
import { injectIntl } from 'react-intl'

import { Button } from '@blueprintjs/core'
import { EditorState, RichUtils } from 'draft-js'

import { IntlShape } from 'react-intl'

function typeEquals (editorState: EditorState, type: string) {
  return (
    editorState
      .getCurrentContent()
      .getBlockForKey(editorState.getSelection().getStartKey())
      .getType() === type
  )
}

type Action = {
  name: ActionName,
  iconName: string,
  call: (editorState: EditorState) => EditorState,
  active: (editorState: EditorState) => boolean,
}
type ActionName =
  | 'bold'
  | 'italic'
  | 'code'
  | 'blockquote'
  | 'ol'
  | 'ul'
  | 'header'
const ACTIONS: Action[] = [
  {
    name: 'bold',
    iconName: 'bold',
    call: eS => RichUtils.toggleInlineStyle(eS, 'BOLD'),
    active: eS => eS.getCurrentInlineStyle().has('BOLD'),
  },
  {
    name: 'italic',
    iconName: 'italic',
    call: eS => RichUtils.toggleInlineStyle(eS, 'ITALIC'),
    active: eS => eS.getCurrentInlineStyle().has('ITALIC'),
  },
  {
    name: 'code',
    iconName: 'code',
    call: eS => RichUtils.toggleInlineStyle(eS, 'CODE'),
    active: eS => eS.getCurrentInlineStyle().has('CODE'),
  },
  {
    name: 'header',
    iconName: 'header',
    call: eS => RichUtils.toggleBlockType(eS, 'header-two'),
    active: eS => typeEquals(eS, 'header-two'),
  },
  {
    name: 'blockquote',
    iconName: 'citation',
    call: eS => RichUtils.toggleBlockType(eS, 'blockquote'),
    active: eS => typeEquals(eS, 'blockquote'),
  },
  {
    name: 'ol',
    iconName: 'numbered-list',
    call: eS => RichUtils.toggleBlockType(eS, 'ordered-list-item'),
    active: eS => typeEquals(eS, 'ordered-list-item'),
  },
  {
    name: 'ul',
    iconName: 'properties',
    call: eS => RichUtils.toggleBlockType(eS, 'unordered-list-item'),
    active: eS => typeEquals(eS, 'unordered-list-item'),
  },
]

type Props = {
  actions: { [ActionName]: boolean },
  editorState: EditorState,
  intl: IntlShape,
  onChange: EditorState => mixed,
}
const FormattingToolbar = ({ actions, editorState, intl, onChange }: Props) => {
  return (
    <ButtonGroup>
      {ACTIONS.filter(action => actions[action.name] !== false).map(action => (
        <Button
          key={action.name}
          iconName={action.iconName}
          active={action.active(editorState)}
          aria-label={intl.formatMessage({
            id: action.name,
            defaultMessage: action.name,
          })}
          onClick={(e: SyntheticMouseEvent<*>) => {
            e.preventDefault()
            e.stopPropagation()
            onChange(action.call(editorState))
          }}
        />
      ))}
    </ButtonGroup>
  )
}

FormattingToolbar.defaultProps = {
  actions: {},
}

export default injectIntl(FormattingToolbar)

const ButtonGroup = styled.div.attrs({
  className: ({ active }) =>
    `pt-button-group pt-minimal pt-small ${active ? 'pt-intent-primary' : ''}`,
})`
  margin: 0 0 3px -6px;
`
