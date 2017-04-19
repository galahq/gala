import React from 'react'
import { DragSource } from 'react-dnd'

export function ReaderIcon ({ initials, imageUrl }) {
  return (
    <div id="reader-icon" style={{ backgroundImage: `url(${imageUrl})` }}>
      {imageUrl === null ? initials : ''}
    </div>
  )
}

let readerSource = {
  beginDrag (props) {
    return {
      readers: [props.reader.id],
    }
  },
}

let collect = (connect, monitor) => {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
  }
}

class ReaderTag extends React.Component {
  constructor (props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
  }
  handleClick () {
    this.props.selectReader(this.props.reader)
  }

  render () {
    let { reader, selected, connectDragSource, isDragging } = this.props
    let { id, name } = reader

    return connectDragSource(
      <li className="enrollments-reader">
        <div
          className="reader-tag"
          data-reader-id={id}
          style={{ opacity: isDragging ? 0.5 : 1 }}
          onClick={this.handleClick}
        >
          <ReaderIcon {...reader} />
          <span className={`reader-name ${selected ? 'reader-selected' : ''}`}>
            {name}
            <div className="enrollments-reader-plus">+</div>
          </span>
        </div>
      </li>
    )
  }
}

export let Reader = DragSource('reader', readerSource, collect)(ReaderTag)
