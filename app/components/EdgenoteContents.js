import React from 'react'
import {Link} from 'react-router'
import {ScrollLock} from 'ScrollLock.js'
import {orchard} from 'concerns/orchard.js'

class EdgenoteContents extends React.Component {

  constructor() {
    super()
    this.state = {
      content: null
    }
  }

  componentDidMount() {
    orchard(`edgenotes/${this.props.params.edgenoteID}`).then(this.parseContentsFromJSON.bind(this))
    $(document).on('keydown', (e) => {
      if (e.which === 27) {
        $(document).off('keydown')
        this.props.history.push(this.returnLink())
      }
    })
  }

  parseContentsFromJSON(r) {
    this.setState(r)
  }

  returnLink() {
    if (this.props.params.selectedPage) {
      return `/${this.props.params.selectedPage}`
    } else {
      return `/edgenotes`
    }
  }

  render() {
    return (
      <div className="EdgenoteContents">
        <Link to={this.returnLink()} className="dismiss EdgenoteContents-dismiss">
          &nbsp;
        </Link>
        <aside className="EdgenoteContents-window">
          <EdgenoteDisplay {...this.state} />
          <EdgenoteSidebar {...this.state} />
        </aside>
      </div>
    )
  }

}

export default ScrollLock(EdgenoteContents, ".EdgenoteContents-window")

class EdgenoteDisplay extends React.Component {

  renderContent() {
    switch(this.props.format) {
    case "link":
      return <a href={this.props.websiteUrl} target="_blank">
        <div className="linkOverlay" dangerouslySetInnerHTML={{__html: require(`../assets/images/react/link.svg`)}} />
        <img src={`${this.props.imageUrl}?w=700&htn=3&con=-40&mono=1E2934`} />
      </a>
    case "aside":
      return <div className="Card scrolling" dangerouslySetInnerHTML={{__html: this.props.content}} />
    case "video":
      return <div style={{height: "100%", width: "100%"}} dangerouslySetInnerHTML={{__html: this.props.content}} />
    default:
      return <img src={this.props.imageUrl} />
    }
  }

  render() {
    return <div className="EdgenoteDisplay">
      {this.renderContent()}
    </div>
  }

}

class EdgenoteSidebar extends React.Component {

  renderFormatIcon() {
    let {format} = this.props
    if (format !== undefined) {
      return (
        <div
          className={`edgenote-icon edgenote-icon-${format}`}
          dangerouslySetInnerHTML={{__html: require(`../assets/images/react/edgenote-${format}.svg`)}}
        />
      )
    }
  }

  render() {
    return <section className="EdgenoteSidebar-meta">
        <div>
          {this.renderFormatIcon()}
          <h4>{this.props.caption}</h4>
        </div>
        <p>{this.props.instructions}</p>
      </section>
  }

}
