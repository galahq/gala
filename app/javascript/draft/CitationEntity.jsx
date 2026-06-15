/**
 * @providesModule CitationEntity
 *
 */

import * as React from 'react' // eslint-disable-line no-unused-vars
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import { LabelForScreenReaders } from 'utility/A11y'
import { acceptKeyboardClick } from 'shared/keyboard'

import { openCitation } from 'redux/actions'



function mapStateToProps (state, ownProps) {
  const citation = state.ui.openedCitation
  return {
    editable: state.edit.inProgress,
    isOpen: citation?.key === ownProps.entityKey,
  }
}

function mapDispatchToProps (dispatch, ownProps) {
  return {
    open: labelRef => dispatch(openCitation(ownProps.entityKey, labelRef)),
    close: () => dispatch(openCitation(null)),
  }
}


class CitationSpan extends React.Component {
  label = null

  render () {
    let { isOpen, open, close, editable, entityKey, children } = this.props

    let citationLabel = !editable && isOpen ? '×' : '○'
    let toggle = isOpen ? close : () => this.label && open(this.label)
    return (
      <span
        data-test-id="CitationEntity"
        role="button"
        style={styles.label}
        ref={e => (this.label = e)}
        onClick={toggle}
        onKeyPress={acceptKeyboardClick}
      >
        <sup>
          {children.map(child =>
            React.cloneElement(child, {
              forceSelection: true,
              text: citationLabel,
            })
          )}
        </sup>
        {editable || (
          <LabelForScreenReaders>
            <a id={`citation-marker-${entityKey}`} tabIndex="0">
              <FormattedMessage id="cards.show.openCitation" />
            </a>
          </LabelForScreenReaders>
        )}
      </span>
    )
  }
}

const CitationEntity = connect(
  mapStateToProps,
  mapDispatchToProps
)(CitationSpan)

export default CitationEntity

const styles = {
  label: {
    color: '#4a8e50',
    cursor: 'pointer',
    display: 'inline-block',
    fontWeight: 600,
    marginLeft: -1,
    width: 8,
  },
}
