import React from 'react'
import { DropTarget } from 'react-dnd'
import { Orchard } from 'concerns/orchard'

let CaseEnrollmentTarget = {
  drop(props, monitor) {
    let item = monitor.getItem()
    Orchard.espalier(`admin/cases/${props.caseSlug}/readers/${item.readers}/enrollments/upsert`, {status: props.type})
      .then((r) => {
        props.updateEnrollments(props.caseSlug, r)
      })
  }
}

let collect = (connect, monitor) => {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver()
  }
}

class CaseEnrollmentTag extends React.Component {
  pluralize() {
    let {enrollments, type} = this.props
    let num = enrollments[type].length
    return `${num} ${type}${num === 1 ? "" : "s"}`
  }

  render() {
    let {connectDropTarget, isOver} = this.props
    return connectDropTarget(
      <div className={`enrollments-case-status-drop${isOver ? " enrollments-case-status-drop-over" : ""}`}>
        {this.pluralize()}
      </div>
    )
  }
}

export let CaseEnrollment = DropTarget('reader', CaseEnrollmentTarget, collect)(CaseEnrollmentTag)
