import React from 'react'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import { toggleEditing, saveChanges } from 'redux/actions'

import type { State } from 'redux/state'

function mapStateToProps (state: State) {
  let { edit, caseData } = state
  let { inProgress } = edit
  let { published } = caseData
  return {
    editable: edit.possible,
    editing: inProgress,
    edited: edit.changed,
    messages: {
      instructions: inProgress
        ? 'statusBar.editInstructions'
        : published ? '' : 'statusBar.betaNotification',
      editToggle: inProgress ? 'statusBar.endEdit' : 'statusBar.beginEdit',
      save: 'statusBar.save',
    },
  }
}

function StatusBar ({
  editable,
  editing,
  edited,
  messages,
  toggleEditing,
  saveChanges,
}) {
  return (
    <div
      className={
        (messages.instructions || editable) &&
        `flash flash-${editing ? 'editing' : 'info'}`
      }
    >
      {messages.instructions && <FormattedMessage id={messages.instructions} />}
      {(editable || edited) &&
        <span>
          {messages.instructions && <span> — </span>}
          {editable &&
            <a onClick={toggleEditing}>
              {messages.editToggle &&
                <FormattedMessage id={messages.editToggle} />}
            </a>}
          {edited && [
            <span key="1"> </span>,
            <a key="2" onClick={saveChanges}>
              {messages.save && <FormattedMessage id={messages.save} />}
            </a>,
          ]}
        </span>}
    </div>
  )
}

export default connect(mapStateToProps, { toggleEditing, saveChanges })(
  StatusBar
)
