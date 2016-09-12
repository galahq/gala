import React from 'react'
import {Link} from 'react-router'
import {orchard} from 'concerns/orchard.js'
import LoadingIcon from 'LoadingIcon.js'

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

  parseContentsFromJSON(response) {
    let contents = {
      "caption": {__html: response.caption},
      "cover": <img src={`${response.thumbnailUrl}?w=640`} />,
      "format": response.format
    }
    this.setState({contents: contents})
  }

  downloadContents() {
    orchard(`edgenotes/${this.props.slug}`).then(this.parseContentsFromJSON.bind(this))
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
      let slug = this.props.slug
      let className = this.className()
      return (
        <Link
          to={`${this.props.pathPrefix}/edgenotes/${slug}`}
          className={className}
          onMouseOver={this.handleMouseOver.bind(this)}
          onMouseOut={this.handleMouseOut.bind(this)}
          >
          <div>
            <div>{cover}</div>
            <div
              className={`edgenote-icon edgenote-icon-${format}`}
              dangerouslySetInnerHTML={{__html: require(`../assets/images/react/edgenote-${format}.svg`)}}
            />
            <figcaption className={ slug == this.props.selectedEdgenote ? "focus" : "" } dangerouslySetInnerHTML={caption} />
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
