import React from 'react'
import {Link} from 'react-router'
import {Orchard} from 'concerns/orchard.js'
import LoadingIcon from 'LoadingIcon.js'
import {Statistics} from 'Statistics.js'

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

  componentWillReceiveProps() {
    if (this.props.didSave !== null) {
      this.downloadContents()
    }
  }

  parseContentsFromJSON(response) {
    let contents = response
    contents.caption = {__html: response.caption}
    contents.cover = <img src={`${response.thumbnailUrl}?w=640`} />
    this.setState({
      contents: contents,
      extant: true
    })
  }

  downloadContents() {
    Orchard.harvest(`edgenotes/${this.props.slug}`).then(this.parseContentsFromJSON.bind(this)).catch(() => {
      this.setState({ extant: false })
    })
  }

  createEdgenote() {
    Orchard.graft(`cases/${this.props.caseSlug}/edgenotes`, {slug: this.props.slug}).then(this.parseContentsFromJSON.bind(this))
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

  renderEdgenote() {
    let {cover, caption, format} = this.state.contents
    let slug = this.props.slug
    let className = this.className()
    return <Link
      to={`${this.props.pathPrefix || ""}/edgenotes/${slug}`}
      className={className}
      onMouseOver={this.handleMouseOver.bind(this)}
      onMouseOut={this.handleMouseOut.bind(this)}
    >
      <div className="c-edgenote s-edgenote">
        <Statistics statistics={this.state.contents.statistics} inline={true} />
        <div className="c-edgenote__cover">
          {cover}
        </div>
        <div
          className={`edgenote-icon edgenote-icon-${format}`}
          dangerouslySetInnerHTML={{__html: require(`../assets/images/react/edgenote-${format}.svg`)}}
        />
        <figcaption className={ slug == this.props.selectedEdgenote ? "focus" : "" } dangerouslySetInnerHTML={caption} />
      </div>
    </Link>
  }

  render() {
    if (this.state.extant) {
      return this.renderEdgenote()
    } else if (this.state.extant === false) {
      return <button onClick={this.createEdgenote.bind(this)}>{`Create ${this.props.slug} Edgenote`}</button>
    } else {
      return <LoadingIcon />
    }
  }
}

export default Edgenote
