import React from 'react'
import {Link} from 'react-router'
import fetchFromWP from '../wp-api.js'
import LoadingIcon from './LoadingIcon.js'
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
    this.state = {
      hovering: false,
      contents: null
    }
  }

  edgenoteCoverImage(response) {
    if (response.better_featured_image !== null) {
      return <img src={response.better_featured_image.source_url} />
    } else {
      return <img />
    }
  }

  parseContentsFromJSON(response) {
    let contents = {
      "caption": {__html: response.title.rendered},
      "cover": this.edgenoteCoverImage(response),
      "format": response.format
    }
    this.setState({contents: contents})
  }

  downloadContents() {
    fetchFromWP({id: this.props.id}, this.parseContentsFromJSON.bind(this))
  }

  className() {
    if (this.state.hovering)
      return "Edgenote pop"
    else
      return "Edgenote"
  }

  componentDidMount() {
    this.downloadContents()
  }

  render () {
    if (this.state.contents && this.state.contents !== null) {
      let {cover, caption, format} = this.state.contents
      let id = this.props.id
      let className = this.className()
      return (
        <Link
          to={`${this.props.path_prefix}/edgenotes/${id}`}
          className={className}
          onMouseOver={this.handleMouseOver.bind(this)}
          onMouseOut={this.handleMouseOut.bind(this)}
          >
          <div>
            <div>{cover}</div>
            <div
              className={`edgenote-icon edgenote-icon-${format}`}
              dangerouslySetInnerHTML={{__html: require(`../images/edgenote-${format}.svg`)}}
            />
            <figcaption className={ id == this.props.selected_id ? "focus" : "" } dangerouslySetInnerHTML={caption} />
          </div>
        </Link>
      )
    } else {
      return (
        <LoadingIcon />
      )
    }
  }
}

export default Edgenote
