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

  log() {
    if (window.ga) {
      window.ga('set', 'page', `${location.pathname}${location.hash}`)
      window.ga('send', 'pageview', { "title": `${this.state.caption.trunc(40)}` })
    }
  }

  parseContentsFromJSON(r) {
    this.setState(r)
    this.log()
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

  renderWebsiteLink() {
    return <a href={this.props.websiteUrl} target="_blank">
      <div className="linkOverlay" dangerouslySetInnerHTML={{__html: require(`../assets/images/react/link.svg`)}} />
      <img src={`${this.props.imageUrl}${this.props.format != "video" ? "?w=700&htn=3&con=-40&mono=1E2934" : ""}`} />
    </a>
  }

  renderAside() {
    return <div className="Card scrolling" dangerouslySetInnerHTML={{__html: this.props.content}} />
  }

  renderTheatre() {
    return <div style={{height: "100%", width: "100%"}} dangerouslySetInnerHTML={{__html: this.props.embedCode}} />
  }

  renderImage() {
    return <img src={this.props.imageUrl} />
  }

  renderPDF() {
    return <iframe src={`http://docs.google.com/gview?url=${this.props.pdfUrl}&embedded=true` } style={{height: "100%", width: "100%"}} frameBorder="0" />
  }

  renderContent() {
    if (this.props.embedCode !== null) { return this.renderTheatre() }
    else if (this.props.pdfUrl !== null) { return this.renderPDF() }
    else if (this.props.websiteUrl !== null) { return this.renderWebsiteLink() }
    else if (this.props.imageUrl !== null) { return this.renderImage() }
    else { return this.renderAside() }
  }

  render() {
    return <div className="EdgenoteDisplay">
      {this.renderContent()}
      <cite dangerouslySetInnerHTML={{__html: this.props.photoCredit}} />
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
    return <section className="EdgenoteSidebar-meta scrolling">
        <div>
          {this.renderFormatIcon()}
          <h4>{this.props.caption}</h4>
        </div>
        <p dangerouslySetInnerHTML={{__html: this.props.instructions}} />
      </section>
  }

}
