import React from 'react'
import { connect } from 'react-redux'
import {I18n} from 'I18n.js'
import { toggleEditing } from 'redux/actions.js'

function mapStateToProps(state) {
  let {edit, caseData} = state
  let {possible, inProgress} = edit
  let {published} = caseData
  return {
    editing: inProgress,
    message: possible
      ? 'edit_instructions'
      : ( published || 'this_case_is_not_yet_published' ),
  }
}

const StatusBar = ({editing, message, toggleEditing}) =><div
  className={`flash flash-${editing ? "editing" : "info"}`}
>
  <I18n meaning={message}/>
  <span>
    &ensp;&mdash;&ensp;
    <a onClick={toggleEditing}>
      <I18n meaning={editing ? "stop_editing_this_case" : "edit_this_case"} />
    </a>
  </span>
</div>

export default connect(
  mapStateToProps,
  {toggleEditing}
)(StatusBar)
