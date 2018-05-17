/**
 * @providesModule CitationEntity
 * @flow
 */

import * as React from 'react' // eslint-disable-line no-unused-vars
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import { LabelForScreenReaders } from 'utility/A11y'
import { acceptKeyboardClick } from 'shared/keyboard'

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

type Props = {
  isOpen: boolean,
  open: HTMLElement => mixed,
  close: () => mixed,
  editable: boolean,
  children: Array<React.Element<*>>,
  entityKey: string,
}

class CitationSpan extends React.Component<Props> {
  label: ?HTMLElement = null

  render () {
    let { isOpen, open, close, editable, entityKey, children } = this.props

    let citationLabel = !editable && isOpen ? '×' : '◦'
    let toggle = isOpen ? close : () => this.label && open(this.label)
    return (
      <span
        role="button"
        style={styles.label}
        onClick={toggle}
        onKeyPress={acceptKeyboardClick}
      >
        <sup ref={e => (this.label = e)}>
          {children.map(child =>
            React.cloneElement(child, { text: citationLabel })
          )}
          <LabelForScreenReaders>
            <a id={`citation-marker-${entityKey}`} tabIndex="0">
              <FormattedMessage id="cards.show.openCitation" />
            </a>
          </LabelForScreenReaders>
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
