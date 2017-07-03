import React from 'react'
import { connect } from 'react-redux'
import { ScrollLock } from 'deprecated/ScrollLock'
import Tracker from 'utility/Tracker'

function mapStateToProps (state, { match }) {
  return {
    edgenote: state.edgenotesBySlug[match.params.edgenoteSlug],
    caseSlug: state.caseData.slug,
  }
}

class EdgenoteContents extends React.Component {
  constructor (props) {
    super(props)
    this.handleDismiss = () => {
      if (props.location.state && props.location.state.internalLink) {
        props.history.goBack()
      } else {
        props.history.push(`/${props.match.params.position}`)
      }
    }
  }

  componentDidMount () {
    $(document).on('keydown', e => {
      if (e.which === 27) {
        $(document).off('keydown')
        this.handleDismiss()
      }
    })
  }

  render () {
    return (
      <div className="EdgenoteContents">
        <a
          className="dismiss EdgenoteContents-dismiss"
          onClick={this.handleDismiss}
        />
        <aside className="EdgenoteContents-window">
          <EdgenoteDisplay {...this.props.edgenote} />
          <EdgenoteSidebar {...this.props.edgenote} />
          <Tracker
            timerState={'RUNNING'}
            targetKey={`edgenotes/${this.props.edgenote.slug}`}
            targetParameters={{
              name: 'visit_edgenote',
              edgenoteSlug: this.props.edgenote.slug,
            }}
          />
        </aside>
      </div>
    )
  }
}

export default connect(mapStateToProps)(
  ScrollLock(EdgenoteContents, '.EdgenoteContents-window')
)

class EdgenoteDisplay extends React.Component {
  renderWebsiteLink () {
    return (
      <a href={this.props.websiteUrl} target="_blank" rel="noopener noreferrer">
        <div
          className="linkOverlay"
          dangerouslySetInnerHTML={{
            __html: require(`images/link.svg`),
          }}
        />
        <img
          src={`${this.props.imageUrl}${this.props.format !== 'video'
            ? '?w=700&htn=3&con=-40&mono=1E2934'
            : ''}`}
        />
      </a>
    )
  }

  renderAside () {
    return (
      <div
        className="Card scrolling"
        dangerouslySetInnerHTML={{ __html: this.props.content }}
      />
    )
  }

  renderTheatre () {
    return (
      <div
        style={{ height: '100%', width: '100%' }}
        dangerouslySetInnerHTML={{ __html: this.props.embedCode }}
      />
    )
  }

  renderImage () {
    return (
      <a target="_blank" rel="noopener noreferrer" href={this.props.imageUrl}>
        <img src={this.props.imageUrl} />
      </a>
    )
  }

  renderPDF () {
    return (
      <iframe
        src={`http://docs.google.com/gview?url=${this.props
          .pdfUrl}&embedded=true`}
        style={{ height: '100%', width: '100%' }}
        frameBorder="0"
      />
    )
  }

  renderContent () {
    if (this.props.embedCode !== null) {
      return this.renderTheatre()
    } else if (this.props.pdfUrl !== null) {
      return this.renderPDF()
    } else if (this.props.websiteUrl !== null) {
      return this.renderWebsiteLink()
    } else if (this.props.imageUrl !== null) {
      return this.renderImage()
    } else {
      return this.renderAside()
    }
  }

  render () {
    return (
      <div className="EdgenoteDisplay">
        {this.renderContent()}
        <cite
          className="o-bottom-right c-photo-credit"
          dangerouslySetInnerHTML={{ __html: this.props.photoCredit }}
        />
      </div>
    )
  }
}

class EdgenoteSidebar extends React.Component {
  renderFormatIcon () {
    let { format } = this.props
    if (format !== undefined) {
      return (
        <div
          className={`edgenote-icon edgenote-icon-${format}`}
          dangerouslySetInnerHTML={{
            __html: require(`images/edgenote-${format}.svg`),
          }}
        />
      )
    }
  }

  render () {
    let {
      caption,
      format,
      thumbnailUrl,
      embedCode,
      websiteUrl,
      imageUrl,
      pdfUrl,
      instructions,
      slug,
      didSave,
    } = this.props
    let endpoint = `edgenotes/${slug}`
    return (
      <div className="EdgenoteSidebar">
        <section className="EdgenoteSidebar-meta scrolling">
          <div>
            {this.renderFormatIcon()}
            <h4>
              {caption}
            </h4>
          </div>
          <p dangerouslySetInnerHTML={{ __html: instructions }} />
        </section>
      </div>
    )
  }
}
