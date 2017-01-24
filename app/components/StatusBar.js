import React from 'react'
import { connect } from 'react-redux'
import {I18n} from 'I18n.js'
import { toggleEditing, saveChanges } from 'redux/actions.js'

function mapStateToProps(state) {
  let {edit, caseData} = state
  let {inProgress} = edit
  let {published} = caseData
  return {
    editable: edit.possible,
    editing: inProgress,
    edited: edit.changed,
    message: inProgress
      ? 'edit_instructions'
      : ( published || 'this_case_is_not_yet_published' ),
  }
}

const StatusBar = ({editable, editing, edited, message, toggleEditing,
                   saveChanges}) => <div
  className={`flash flash-${editing ? "editing" : "info"}`}
>
  <I18n meaning={message}/>
  <span>
    &ensp;&mdash;&ensp;
    { editable && <a onClick={toggleEditing}>
      <I18n meaning={editing ? "stop_editing_this_case" : "edit_this_case"} />
    </a> }
    { edited && [<span>&ensp;</span>, <a onClick={saveChanges}>Save</a>] }
  </span>
</div>

export default connect(
  mapStateToProps,
  {toggleEditing, saveChanges}
)(StatusBar)
