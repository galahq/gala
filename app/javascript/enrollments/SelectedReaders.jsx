import React from 'react'
import { DragSource } from 'react-dnd'
import { ReaderIcon } from 'enrollments/Reader'

let selectedReadersSource = {
  beginDrag (props) {
    return {
      readers: props.selectedReaders.map(r => {
        return r.id
      }),
    }
  },
}

let collect = (connect, monitor) => {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
  }
}

class SelectedReadersTag extends React.Component {
  render () {
    let { connectDragSource, isDragging, selectedReaders } = this.props
    return connectDragSource(
      <div style={{ opacity: isDragging ? 0.5 : 1 }}>
        {selectedReaders.map(reader => {
          return <ReaderIcon key={`${reader.id}-selected`} {...reader} />
        })}
      </div>,
    )
  }
}

export let SelectedReaders = DragSource(
  'reader',
  selectedReadersSource,
  collect,
)(SelectedReadersTag)
