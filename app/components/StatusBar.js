import React from 'react'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage } from 'react-intl'
import { toggleEditing, saveChanges } from 'redux/actions.js'

function mapStateToProps(state) {
  let {edit, caseData} = state
  let {inProgress} = edit
  let {published} = caseData
  return {
    editable: edit.possible,
    editing: inProgress,
    edited: edit.changed,
    messages: {
      instructions: inProgress
        ? 'statusBar.editInstructions'
        : ( published ? "" : 'statusBar.betaNotification' ),
      editToggle: inProgress ? "statusBar.endEdit" : "statusBar.beginEdit",
      save: 'statusBar.save',
    },
  }
}

const StatusBar = ({editable, editing, edited, messages, toggleEditing,
                   saveChanges}) => <div
  className={(messages.instructions || editable) && `flash flash-${editing ? "editing" : "info"}`}
>
  { messages.instructions && <FormattedMessage id={messages.instructions} /> }
  { (editable || edited) && <span>
    { messages.instructions && <span>&ensp;&mdash;&ensp;</span> }
    { editable && <a onClick={toggleEditing}>
      { messages.editToggle && <FormattedMessage id={messages.editToggle} /> }
    </a> }
    { edited && [<span>&ensp;</span>, <a onClick={saveChanges}>
      { messages.save && <FormattedMessage id={messages.save} /> }
    </a>] }
  </span> }
</div>

export default connect(
  mapStateToProps,
  {toggleEditing, saveChanges}
)(injectIntl(StatusBar))
