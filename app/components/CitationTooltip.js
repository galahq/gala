import React from 'react'
import { EditorState } from 'draft-js'

const CitationTooltip = ({editorState, onChange, openedCitation, editable, onCloseCitation}) => {

  let {href, contents} = editorState.getCurrentContent()
    .getEntity(openedCitation.key).getData()

  let label = openedCitation.labelRef
  let left = label.offsetLeft
  let top = label.offsetTop

  let positionalStyles = {
    position: 'absolute',
    left: left,
    top: top,
    transform: "translate(-50%, calc(-100% + 3px))",
  }

  let closeCitation = editable ? null : close

  let updateCitation = attr => e => {
    const contentState = editorState.getCurrentContent()
    const newContentState = contentState.mergeEntityData(openedCitation.key, {[attr]: e.currentTarget.value})
    onChange(EditorState.push(editorState, newContentState, 'apply-entity'))
  }

  return <cite onClick={closeCitation} style={{ ...styles.tooltip, ...positionalStyles}}>
    {
      editable
        ? <form>
          <input style={styles.field} onChange={updateCitation('contents')} value={contents} placeholder="Citation text" />
          <input style={styles.field} onChange={updateCitation('href')} value={href} placeholder="Resource URL" />
          <button style={styles.button} onClick={onCloseCitation}>Close</button>
        </form>
        : [contents, " ", <a href={href} target="_blank">Read&nbsp;more&nbsp;›</a>]
    }
  </cite>

}

export default CitationTooltip

const styles = {
  tooltip: {
    background: "#6ACB72",
    borderRadius: 2,
    boxShadow: "0 0 10px rgba(black, 0.2)",
    color: 'black',
    display: 'block',
    font: "14px tenso",
    maxWidth: "20em",
    padding: "0.25em 0.5em",
  },
  field: {
    fontFamily: 'tenso',
    width: 'calc(100% - 0.5em)',
    marginTop: '0.25em',
  },
  button: {
    marginBottom: '0.25em',
    color: "#357E3C",
    borderColor: "#357E3C",
    backgroundColor: "#EBEAE4",
  },
}
