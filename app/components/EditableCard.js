import React from 'react'
import {
  Editor,
  EditorState,
  CompositeDecorator,
  RichUtils,
  convertFromRaw,
  DefaultDraftBlockRenderMap
} from 'draft-js'
import Immutable from 'immutable'
import convertFromOldStyleCardSerialization from 'concerns/convertFromOldStyleCardSerialization.js'

import EdgenoteEntity from 'EdgenoteEntity.js'
import CitationEntity from 'CitationEntity.js'

const blockRenderMap = Immutable.Map({
  'unstyled': {
    element: 'p'
  }
})
const extendedBlockRenderMap = DefaultDraftBlockRenderMap.merge(blockRenderMap)

const styleMap = {
  'BOLD': {
    fontWeight: 'inherit',
    letterSpacing: 1,
    fontVariant: 'small-caps'
  },
  'UNDERLINE': {}
}

export class EditableCard extends React.Component {

  constructor(props) {
    super(props)
    let {content, rawContent} = props
    let contentState

    const decorator = new CompositeDecorator([
      {
        strategy: getFindEntityFunction('EDGENOTE'),
        component: EdgenoteEntity
      }, {
        strategy: getFindEntityFunction('CITATION'),
        component: CitationEntity
      }
    ])

    if (rawContent) {
      contentState = convertFromRaw(rawContent)
    } else {
      let convertedRawContent = convertFromOldStyleCardSerialization(content)
      contentState = convertFromRaw(convertedRawContent)
    }

    this.state = {
      editorState: EditorState.createWithContent(contentState, decorator)
    }

    this.handleKeyCommand = this.handleKeyCommand.bind(this)
    this.onChange = (editorState) => {this.setState({editorState: editorState})}
  }

  render() {
    return <Editor
      blockRenderMap={extendedBlockRenderMap}
      customStyleMap={styleMap}

      readOnly={!this.props.didSave}
      editorState={this.state.editorState}

      handleKeyCommand={this.handleKeyCommand}
      onChange={this.onChange}
    />
  }

  handleKeyCommand(command) {
    const newState = RichUtils.handleKeyCommand(this.state.editorState, command);
    if (newState) {
      this.onChange(newState);
      return 'handled';
    }
    return 'not-handled';
  }
}

function getFindEntityFunction(type) {
  return (contentBlock, callback, contentState) => {
    contentBlock.findEntityRanges(
      (character) => {
        const entityKey = character.getEntity();
        return (
          entityKey !== null &&
            contentState.getEntity(entityKey).getType() === type
        )
      },
      callback
    )
  }
}
