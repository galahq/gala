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

const CommentEditor = ({
  editorState,
  innerRef,
  intl,
  onChange,
  onBlur,
}: {|
  editorState: EditorState,
  innerRef: Editor => mixed,
  intl: IntlShape,
  onChange: EditorState => mixed,
  onBlur: EditorState => mixed,
|}) => (
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
      editorState={editorState}
      placeholder={intl.formatMessage({ id: 'comments.new.write' })}
      plugins={[linkifyPlugin]}
      customStyleMap={styleMapWithCode}
      handleKeyCommand={handleKeyCommand} // eslint-disable-line
      onChange={onChange}
      onBlur={onBlur}
    />
  </StyledCommentContainer>
)
export default injectIntl(CommentEditor)
