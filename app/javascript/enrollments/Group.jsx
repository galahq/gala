import React from 'react'
import { DragSource } from 'react-dnd'

export class GroupListItem extends React.Component {
  render () {
    let { group, connectDragSource } = this.props
    let { name, readers } = group

    return connectDragSource(
      <li className="enrollments-group">
        <h4>{name}</h4>
        <p>{`${readers.length} Readers`}</p>
      </li>,
    )
  }
}

let groupSource = {
  beginDrag (props) {
    return {
      readers: [
        props.group.readers.map(r => {
          return r.id
        }),
      ],
    }
  },
}

let collect = (connect, monitor) => {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
  }
}

export let Group = DragSource('reader', groupSource, collect)(GroupListItem)
