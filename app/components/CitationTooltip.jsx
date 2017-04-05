import React from 'react'
import { connect } from 'react-redux'
import { EditorState } from 'draft-js'

import { updateCardContents, openCitation } from 'redux/actions'

function mapStateToProps(state, ownProps) {
  let { editorState } = state.cardsById[ownProps.cardId]
  let {href, contents} = editorState.getCurrentContent()
    .getEntity(ownProps.openedCitation.key).getData()

  return { editorState, href, contents }
}

function mapDispatchToProps(dispatch, ownProps) {
  return {
    onChange: eS => dispatch(updateCardContents(ownProps.cardId, eS)),
    onCloseCitation: () => dispatch(openCitation(null)),
  }
}

const CitationTooltip = ({openedCitation, editable, editorState, href, contents,
                          onChange, onCloseCitation, cardWidth}) => {
  let label = openedCitation.labelRef
  let top = label.offsetTop

  let horizontalCenter = label.offsetLeft - tooltipWidth / 2
  let left = Math.min(cardWidth - tooltipWidth - 21, Math.max(horizontalCenter, 7))


  let positionalStyles = {
    position: 'absolute',
    left: left,
    top: top,
    transform: 'translateY(calc(-100% + 3px)',
  }

  let closeCitation = editable ? null : close

  let updateCitation = attr => e => {
    const contentState = editorState.getCurrentContent()
    /*let newContentState = */contentState.mergeEntityData(openedCitation.key, {[attr]: e.currentTarget.value})
    // When eventually the Entity API is rejiggered so entities are inside of
    // ContentState, then we’ll have to push newcontentState. For now,
    // mergeEntityData is mutating editorState, so we just dispatch the object
    // itself.
    //
    // onChange(EditorState.push(editorState, newContentState, 'apply-entity'))
    onChange(editorState)
  }

  return <cite onClick={closeCitation} style={{ ...styles.tooltip, ...positionalStyles}}>
    {
      editable
        ? <form>
          <input style={styles.field} onChange={updateCitation('contents')} value={contents} placeholder="Citation text" />
          <input style={styles.field} onChange={updateCitation('href')} value={href} placeholder="Resource URL" />
          <button type="button" style={styles.button} onClick={onCloseCitation}>
            Close
          </button>
        </form>
        : [contents, " ", href && <a href={href} target="_blank">Read&nbsp;more&nbsp;›</a>]
    }
  </cite>

}

export default connect(mapStateToProps, mapDispatchToProps)(CitationTooltip)

const tooltipWidth = 294
const styles = {
  tooltip: {
    background: "#6ACB72",
    borderRadius: 2,
    boxShadow: "0 0 10px rgba(black, 0.2)",
    color: 'black',
    display: 'block',
    font: "14px tenso",
    width: tooltipWidth,
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
