import React from 'react'
import {Link} from 'react-router'
import '../stylesheets/Edgenote.scss'

class Edgenote extends React.Component {
  handleMouseOver() {
    this.setState( { hovering: true } )
  }
  handleMouseOut() {
    this.setState( { hovering: false } )
  }

  constructor() {
    super()
    this.state = { hovering: false }
  }

  className() {
    if (this.state.hovering)
      return "pop"
  }

  render () {
    let {id, cover, caption, format} = this.props.contents
    let className = this.className()
    return (
      <Link to={`/read/${this.props.params.id}/${this.props.params.chapter}/edgenotes/${id}`} className={className} onMouseOver={this.handleMouseOver.bind(this)} onMouseOut={this.handleMouseOut.bind(this)} >
        <div>
          <div>{cover}</div>
          <div className={`edgenote-icon edgenote-icon-${format}`} dangerouslySetInnerHTML={{__html: require(`../images/edgenote-${format}.svg`)}} />
          <figcaption className={ id == this.props.selected_id ? "focus" : "" } dangerouslySetInnerHTML={caption} />
        </div>
      </Link>
    )
  }
}

export default Edgenote
