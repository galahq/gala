import React from 'react' // eslint-disable-line no-unused-vars
import { connect } from 'react-redux'

import { openCitation } from 'redux/actions'

import type { State } from 'redux/state'

function mapStateToProps (state: State, ownProps) {
  const citation = state.ui.openedCitation
  return {
    editable: state.edit.inProgress,
    isOpen: citation && citation.key === ownProps.entityKey,
  }
}

function mapDispatchToProps (dispatch, ownProps) {
  return {
    open: labelRef => dispatch(openCitation(ownProps.entityKey, labelRef)),
    close: () => dispatch(openCitation(null)),
  }
}

class CitationSpan extends React.Component {
  render () {
    let { isOpen, open, close, editable, children } = this.props

    let citationLabel = !editable && isOpen ? '×' : '◦'
    let toggle = isOpen ? close : () => open(this.label)
    return (
      <span style={styles.label} onClick={toggle}>
        <sup ref={(e: HTMLElement) => (this.label = e)}>
          {children.map(child =>
            React.cloneElement(child, { text: citationLabel })
          )}
        </sup>
      </span>
    )
  }
}

const CitationEntity = connect(mapStateToProps, mapDispatchToProps)(
  CitationSpan
)

export default CitationEntity

const styles = {
  label: {
    color: '#4a8e50',
    cursor: 'pointer',
    display: 'inline-block',
    marginLeft: -2,
    width: 8,
  },
}
