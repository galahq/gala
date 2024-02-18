/**
 * @providesModule FormattingToolbar
 * @flow
 */

import * as React from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'
import { injectIntl } from 'react-intl'

import { Button } from '@blueprintjs/core'
import { EditorState, RichUtils } from 'draft-js'

import { displayToast } from 'redux/actions'
import {
  blockTypeEquals,
  entityTypeEquals,
  toggleEdgenote,
  addCitationEntity,
  toggleMath,
} from './helpers'

import MaybeSpotlight from 'shared/spotlight/MaybeSpotlight'

import type { IntlShape } from 'react-intl'

type Action = {
  name: ActionName,
  icon: string | React.Node,
  call: (editorState: EditorState, props: Props) => Promise<EditorState>,
  active: (editorState: EditorState) => boolean,
  spotlightKey?: string,
}

type ActionName =
  | 'italic'
  | 'code'
  | 'blockquote'
  | 'ol'
  | 'ul'
  | 'header'
  | 'addEdgenoteEntity'
  | 'addCitationEntity'
  | 'addMathEntity'

const ACTIONS: Action[] = [
  {
    name: 'italic',
    icon: 'italic',
    call: async eS => RichUtils.toggleInlineStyle(eS, 'ITALIC'),
    active: eS => eS.getCurrentInlineStyle().has('ITALIC'),
  },

  {
    name: 'code',
    icon: 'code',
    call: async eS => RichUtils.toggleInlineStyle(eS, 'CODE'),
    active: eS => eS.getCurrentInlineStyle().has('CODE'),
  },

  {
    name: 'header',
    icon: 'header',
    call: async eS => RichUtils.toggleBlockType(eS, 'header-two'),
    active: blockTypeEquals('header-two'),
  },

  {
    name: 'blockquote',
    icon: 'citation',
    call: async eS => RichUtils.toggleBlockType(eS, 'blockquote'),
    active: blockTypeEquals('blockquote'),
  },

  {
    name: 'ol',
    icon: 'numbered-list',
    call: async eS => RichUtils.toggleBlockType(eS, 'ordered-list-item'),
    active: blockTypeEquals('ordered-list-item'),
  },

  {
    name: 'ul',
    icon: 'properties',
    call: async eS => RichUtils.toggleBlockType(eS, 'unordered-list-item'),
    active: blockTypeEquals('unordered-list-item'),
  },

  {
    name: 'addEdgenoteEntity',
    icon: 'add-column-right',
    call: toggleEdgenote,
    active: entityTypeEquals('EDGENOTE'),
    spotlightKey: 'add_edgenote',
  },

  {
    name: 'addCitationEntity',
    icon: 'bookmark',
    call: async (eS, props) => addCitationEntity(eS, props),
    active: blockTypeEquals('unordered-list-item'),
    spotlightKey: 'add_citation',
  },

  {
    name: 'addMathEntity',
    icon: 'function',
    call: async (eS, props) => toggleMath(eS, props),
    active: entityTypeEquals('MATH'),
    spotlightKey: 'add_math',
  },
]

type Props = {
  actions: { [ActionName]: boolean },
  cardId: string,
  displayToast: typeof displayToast,
  editorState: EditorState,
  getEdgenote: ?() => Promise<string>,
  intl: IntlShape,
  onChange: EditorState => mixed,
}

const FormattingToolbar = (props: Props) => {
  const { actions, editorState, intl, onChange } = props
  return (
    <ButtonGroup>
      {ACTIONS.filter(action => actions[action.name] !== false).map(action => {
        const messageId = `helpers.formatting.${action.name}`
        const spotlightKey = action.spotlightKey
          ? action.spotlightKey
          : undefined

        return (
          <MaybeSpotlight
            key={action.name}
            placement="top"
            spotlightKey={spotlightKey}
          >
            {({ ref }) => (
              <Button
                elementRef={ref}
                icon={action.icon}
                active={action.active(editorState)}
                aria-label={intl.formatMessage({ id: messageId })}
                title={intl.formatMessage({ id: messageId })}
                onClick={async (e: SyntheticMouseEvent<*>) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onChange(await action.call(editorState, props))
                }}
              />
            )}
          </MaybeSpotlight>
        )
      })}
    </ButtonGroup>
  )
}

FormattingToolbar.defaultProps = {
  actions: {},
}

export default connect(
  null,
  { displayToast }
)(injectIntl(FormattingToolbar))

const ButtonGroup = styled.div.attrs({
  className: ({ active }) =>
    `pt-button-group pt-minimal pt-small ${active ? 'pt-intent-primary' : ''}`,
})`
  margin: 0 0 3px -6px;
`
