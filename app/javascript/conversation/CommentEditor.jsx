/**
 * @providesModule CommentEditor
 * @flow
 */

import * as React from 'react'
import { injectIntl } from 'react-intl'

import Editor from 'draft-js-plugins-editor'
import { EditorState, RichUtils } from 'draft-js'
import createLinkifyPlugin from 'draft-js-linkify-plugin'

import { StyledCommentContainer } from 'conversation/shared'

import type { IntlShape } from 'react-intl'

const linkifyPlugin = createLinkifyPlugin({ target: '_blank' })

function handleKeyCommand (command: string, editorState: EditorState) {
  const newState = RichUtils.handleKeyCommand(editorState, command)
  if (newState) {
    this.onChange(newState) // `this` is the Editor component
    return 'handled'
  }

  if (command === 'noop') return 'handled'

  return 'not-handled'
}

const styleMapWithCode = {
  CODE: {
    borderRadius: 3,
    boxShadow: 'inset 0 0 0 1px rgba(16, 22, 26, 0.2)',
    background: 'rgba(253, 253, 250, 0.7)',
    padding: '2px 5px',
    color: '#5c7080',
    fontFamily: 'monospace',
    fontSize: 'smaller',
  },
}

type Props = {|
  editorState: EditorState,
  innerRef: (?Editor) => any,
  intl: IntlShape,
  keyBindingFn?: (e: SyntheticKeyboardEvent<*>) => ?string,
  onChange: EditorState => any,
  onBlur: (SyntheticEvent<*>) => any,
|}

const CommentEditor = ({
  editorState,
  innerRef,
  intl,
  keyBindingFn,
  onChange,
  onBlur,
}: Props) => (
  <StyledCommentContainer
    hidePlaceholder={
      !editorState.getCurrentContent().hasText() &&
      editorState
        .getCurrentContent()
        .getBlockMap()
        .first()
        .getType() !== 'unstyled'
    }
  >
    <Editor
      ref={innerRef}
      customStyleMap={styleMapWithCode}
      editorState={editorState}
      handleKeyCommand={handleKeyCommand}
      keyBindingFn={keyBindingFn}
      placeholder={intl.formatMessage({ id: 'comments.new.write' })}
      plugins={[linkifyPlugin]}
      onBlur={onBlur}
      onChange={onChange}
    />
  </StyledCommentContainer>
)
export default injectIntl(CommentEditor)
