import React from 'react'
import { connect } from 'react-redux'
import {Trackable} from 'concerns/trackable.js'
import {ScrollLock} from 'ScrollLock.js'
import {Editable, EditableHTML, EditableAttribute} from 'Editable.js'

function mapStateToProps(state, {match}) {
  return {
    edgenote: state.edgenotesBySlug[match.params.edgenoteSlug],
    caseSlug: state.caseData.slug,
  }
}

class EdgenoteContents extends React.Component {
  eventName() { return "visit_edgenote" }

  trackableArgs() { return {
    edgenote_slug: this.props.edgenote.slug,
    case_slug: this.props.caseSlug,
  } }

  constructor(props) {
    super(props)
    this._handleDismiss = () => {
      if (props.location.state && props.location.state.internalLink) {
        props.history.goBack()
      } else {
        props.history.push(`/${props.match.params.position}`)
      }
    }
  }

  componentDidMount() {
    $(document).on('keydown', (e) => {
      if (e.which === 27) {
        $(document).off('keydown')
        this._handleDismiss()
      }
    })
  }

  didSave(newData) {
    this.props.didSave(newData["case"])
    this.parseContentsFromJSON(newData)
  }

  handleDismiss() {
  }

  render() {
    return (
      <div className="EdgenoteContents">
        <a onClick={this._handleDismiss} className="dismiss EdgenoteContents-dismiss">
          &nbsp;
        </a>
        <aside className="EdgenoteContents-window">
          <EdgenoteDisplay didSave={null} {...this.props.edgenote} />
          <EdgenoteSidebar didSave={null} {...this.props.edgenote} />
        </aside>
      </div>
    )
  }

}

export default connect(mapStateToProps)(ScrollLock(EdgenoteContents, ".EdgenoteContents-window"))

class EdgenoteDisplay extends React.Component {

  renderWebsiteLink() {
    return <a href={this.props.websiteUrl} target="_blank">
      <div className="linkOverlay" dangerouslySetInnerHTML={{__html: require(`../assets/images/react/link.svg`)}} />
      <img src={`${this.props.imageUrl}${this.props.format != "video" ? "?w=700&htn=3&con=-40&mono=1E2934" : ""}`} />
    </a>
  }

  renderAside() {
    return <EditableHTML uri={`edgenotes/${this.props.slug}:content`} placeholder="<!-- HTML aside content -->" didSave={this.props.didSave}>
      <div className="Card scrolling" dangerouslySetInnerHTML={{__html: this.props.content}} />
    </EditableHTML>
  }

  renderTheatre() {
    return <div style={{height: "100%", width: "100%"}} dangerouslySetInnerHTML={{__html: this.props.embedCode}} />
  }

  renderImage() {
    return <a target="_blank" href={this.props.imageUrl}><img src={this.props.imageUrl} /></a>
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
      <EditableHTML uri={`edgenotes/${this.props.slug}:photo_credit`} placeholder="<!-- HTML photo credit -->" didSave={this.props.didSave}>
        <cite className="o-bottom-right c-photo-credit" dangerouslySetInnerHTML={{__html: this.props.photoCredit}} />
      </EditableHTML>
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
    let {caption, format, thumbnailUrl, embedCode, websiteUrl,
      imageUrl, pdfUrl, instructions, slug, didSave} = this.props
    let endpoint = `edgenotes/${slug}`
    return <div className="EdgenoteSidebar">
      <section className="EdgenoteSidebar-meta scrolling">
        <div>
          {this.renderFormatIcon()}
          <Editable uri={`${endpoint}:caption`} placeholder="Edgenote Caption" didSave={didSave}>
            <h4>{caption}</h4>
          </Editable>
        </div>
        <EditableHTML uri={`${endpoint}:instructions`} placeholder="<!-- HTML instructions -->" didSave={didSave}>
          <p dangerouslySetInnerHTML={{__html: instructions}} />
        </EditableHTML>
      </section>
      <div>
        <EditableAttribute placeholder="Thumbnail URL"
          uri={`${endpoint}:thumbnail_url`}
          didSave={didSave}>{thumbnailUrl}</EditableAttribute>
        <EditableAttribute placeholder="Format" uri={`${endpoint}:format`} didSave={didSave}>{format}</EditableAttribute>
      </div>
      <div>
        <EditableAttribute placeholder="Embed Code"
          uri={`${endpoint}:embed_code`}
          didSave={didSave}>{embedCode}</EditableAttribute>
        <EditableAttribute placeholder="PDF URL"
          uri={`${endpoint}:pdf_url`}
          didSave={didSave}>{pdfUrl}</EditableAttribute>
        <EditableAttribute placeholder="Website URL"
          uri={`${endpoint}:website_url`}
          didSave={didSave}>{websiteUrl}</EditableAttribute>
        <EditableAttribute placeholder="Image URL"
          uri={`${endpoint}:image_url`}
          didSave={didSave}>{imageUrl}</EditableAttribute>
      </div>
    </div>
  }

}
