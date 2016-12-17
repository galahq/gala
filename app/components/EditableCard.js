import React from 'react'
import {
  Editor,
  ContentState,
  EditorState,
  CompositeDecorator,
  convertFromHTML,
  convertFromRaw,
  convertToRaw
} from 'draft-js'

export class EditableCard extends React.Component {

  constructor(props) {
    super(props)
    let {content, rawContent} = props
    let contentState

    const decorator = new CompositeDecorator([
      {
        strategy: findEdgenoteEntities,
        component: EdgenoteHighlight
      }
    ])

    const EdgenoteUrlPrefix = "http://learnmsc.org///edgenote/"

    if (!rawContent) {
      // If there is no RawDraftContentState persisted, we need to try to
      // convert from the old way of serializing edgenotes and citations in HTML
      // as anchors and cite tags.
      // Since draft.js only preserves href from links, we're going to have to
      // add a specially formatted href.
      let transformedContent = content.replace(/data-edgenote="/g, `href="${EdgenoteUrlPrefix}`)
      let blocksFromHTML = convertFromHTML(transformedContent)
      var convertedRawContent = convertToRaw(ContentState.createFromBlockArray(
        blocksFromHTML.contentBlocks,
        blocksFromHTML.entityMap
      ))

      Object.keys(convertedRawContent.entityMap).forEach((key) => {
        let entity = convertedRawContent.entityMap[`${key}`]
        if (entity.data.url.startsWith(EdgenoteUrlPrefix)) {
          convertedRawContent.entityMap[`${key}`] = {
            type: "EDGENOTE",
            mutability: "MUTABLE",
            data: { slug: entity.data.url.match(RegExp(`${EdgenoteUrlPrefix}(.+)`))[1] }
          }
        }
      })

      contentState = convertFromRaw(convertedRawContent)
    } else {
      contentState = convertFromRaw(rawContent)
    }

    this.state = {
      editorState: EditorState.createWithContent(contentState, decorator)
    }
  }

  render() {
    return <Editor
      editorState={this.state.editorState}
      readOnly={!this.props.didSave}
      onChange={(eS) => {this.setState({editorState: eS})}}
    />
  }

}

function findEdgenoteEntities(contentBlock, callback, contentState) {
  contentBlock.findEntityRanges(
    (character) => {
      const entityKey = character.getEntity();
      return (
        entityKey !== null &&
          contentState.getEntity(entityKey).getType() === 'EDGENOTE'
      )
    },
    callback
  )
}

const EdgenoteHighlight = (props) => {
  const {slug} = props.contentState.getEntity(props.entityKey).getData()
  return <a data-edgenote={slug}>{props.children}</a>
}
