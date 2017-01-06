import React from 'react'
import { RichUtils } from 'draft-js'


const EditorToolbar = ({editorState, onChange}) => {
  let toggleInline = (style) => () => {
    onChange(RichUtils.toggleInlineStyle(editorState, style))
  }

  let toggleBlock = (type) => () => {
    onChange(RichUtils.toggleBlockType(editorState, type))
  }

  return <div className="c-editor-toolbar" style={styles.bar}>
    <a onMouseDown={e => e.preventDefault()} onClick={toggleInline('BOLD')}
      dangerouslySetInnerHTML={{__html: require(`toolbar-small-caps.svg`)}} />

    <a onMouseDown={e => e.preventDefault()} onClick={toggleInline('ITALIC')}
      dangerouslySetInnerHTML={{__html: require(`toolbar-italic.svg`)}} />

    <a onMouseDown={e => e.preventDefault()} onClick={toggleBlock('ordered-list-item')}
      dangerouslySetInnerHTML={{__html: require(`toolbar-ol.svg`)}} />

    <a onMouseDown={e => e.preventDefault()} onClick={toggleBlock('unordered-list-item')}
      dangerouslySetInnerHTML={{__html: require(`toolbar-ul.svg`)}} />

    <a dangerouslySetInnerHTML={{__html: require(`toolbar-edgenote.svg`)}} />
    <a dangerouslySetInnerHTML={{__html: require(`toolbar-citation.svg`)}} />
  </div>
}

export default EditorToolbar


const styles = {
  bar: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    backgroundColor: "#D6D4CA",
    borderBottom: "1px solid #BFBDAF",
    borderRadius: '2px 2px 0 0',
    padding: '0.3em 0.75em 0 0.75em',
    boxSizing: 'border-box',
  },
}
