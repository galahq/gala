import React from 'react'
import {
  Editor,
  EditorState,
  CompositeDecorator,
  convertToRaw,
  convertFromRaw
} from 'draft-js'
import convertFromOldStyleCardSerialization from 'concerns/convertFromOldStyleCardSerialization.js'

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

    console.log(convertToRaw(this.state.editorState.getCurrentContent()))
  }

  render() {
    return <Editor
      editorState={this.state.editorState}
      readOnly={!this.props.didSave}
      onChange={(eS) => {this.setState({editorState: eS})}}
    />
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

const EdgenoteEntity = (props) => {
  let {slug} = props.contentState.getEntity(props.entityKey).getData()
  return <a data-edgenote={slug}>{props.children}</a>
}

const CitationEntity = (props) => {
  let {href, contents} = props.contentState.getEntity(props.entityKey).getData()
  return <span className="citation" onClick={(e) => window.toggleCitation(e)}>
    <span className="citation-label"><sup>◦</sup></span>
    <cite>
      {contents}
      {" "}
      <a href={href} target="_blank">Read more ›</a>
    </cite>
  </span>
}
