import React from 'react'
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
      <figure className={className} onMouseOver={this.handleMouseOver.bind(this)} onMouseOut={this.handleMouseOut.bind(this)} >
        <div>
          <div>{cover}</div>
          <div className={`edgenote-icon edgenote-icon-${format}`} dangerouslySetInnerHTML={{__html: require(`../images/edgenote-${format}.svg`)}} />
          <figcaption className={ id == this.props.selected_id ? "focus" : "" } dangerouslySetInnerHTML={caption} />
        </div>
      </figure>
    )
  }
}

export default Edgenote
