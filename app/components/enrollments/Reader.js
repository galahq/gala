import React from 'react'
import { DragSource } from 'react-dnd'

export class ReaderIcon extends React.Component {
  render() {
    let {initials, imageUrl} = this.props
    return <div id="reader-icon" style={{backgroundImage: `url(${imageUrl})`}}>
      {imageUrl === null ? initials : ""}
    </div>
  }
}

let readerSource = {
  beginDrag(props) {
    return {
      readers: [props.reader.id]
    }
  }
}

let collect = (connect, monitor) => {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  }
}

class ReaderTag extends React.Component {
  handleClick() {
    this.props.selectReader(this.props.reader)
  }

  render() {
    let {reader, selected, connectDragSource, isDragging} = this.props
    let {id, name} = reader

    return connectDragSource(
      <li className="enrollments-reader">
        <div
          className="reader-tag"
          onClick={this.handleClick.bind(this)}
          data-reader-id={id}
          style={{opacity: isDragging ? 0.5 : 1}}
        >
          <ReaderIcon {...reader} />
          <span className={`reader-name ${selected ? "reader-selected" : ""}`}>
            {name}
            <div className="enrollments-reader-plus">+</div>
          </span>
        </div>
      </li>
    )
  }
}

export let Reader = DragSource('reader', readerSource, collect)(ReaderTag)
