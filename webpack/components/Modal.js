import React from 'react'
import {Link} from 'react-router'

import {ScrollLock} from './ScrollLock.js'

import fetchFromWP from '../wp-api.js'

class Modal extends React.Component {

  constructor() {
    super()
    this.state = {
      contents: null
    }
  }

  modalShouldOpenLinks(r) {
    return r.format === "link" || (r.format === "video" && r.content.rendered.match(/<a href=/))
  }

  parseContentsFromJSON(r) {
    if (this.modalShouldOpenLinks(r)) {
      let linkMatch = r.content.rendered.match(/<a href=\"([^ ]*)\"/)
      var link
      if (linkMatch !== null) {
        link = linkMatch[1]
        window.open(link, "_blank")
        this.setState({
          contents: {__html: `<a href="${link}" target="_blank">open_in_new_tab</a>`}
        })
      }
    } else {
      this.setState({
        caption: {__html: r.title.rendered},
        contents: {__html: r.content.rendered},
        format: r.format
      })
    }
  }

  componentDidMount() {
    fetchFromWP({id: this.props.params.edgenoteID}, this.parseContentsFromJSON.bind(this))
  }

  renderFormatDifferentiatedContent(format) {
    var x = document.createElement("div")
    x.innerHTML = this.state.contents.__html

    var formats = {
      "aside": () => {
        return <div className="Card" dangerouslySetInnerHTML={this.state.contents} />
      },
      "video": () => {
        var video = x.querySelector('iframe')
        if (video)
          return <div className="Modal-theatre" dangerouslySetInnerHTML={{__html: video.outerHTML}} />
      },
      "image": () => {
        var image = x.querySelector('img')
        var caption = x.textContent||x.innerText
        if (caption && caption.trim() ) {
          var captionCard = <div className="Card" dangerouslySetInnerHTML={{__html: caption}} />
        }
        return (
          <div className="Modal-gallery">
            <img src={image.getAttribute("src")} />
            {captionCard}
          </div>
        )
      }
    }
    if (formats[format])
      return formats[format]()
    else
      return formats["aside"]()
  }

  renderModalContents() {
    if (this.state.contents === null) {
      return (
        <aside>
          <div className="loading-icon" dangerouslySetInnerHTML={{__html: require('../images/loading.svg')}} />
        </aside>
      )
    } else {
      return (
        <aside>
          <div className="Modal-contents" >
            {this.renderFormatDifferentiatedContent(this.state.format)}
          </div>
        </aside>
      )
    }
  }

  renderFormatIcon() {
    let {format} = this.state
    if (format !== undefined) {
      return (
        <div
          className={`edgenote-icon edgenote-icon-${format}`}
          dangerouslySetInnerHTML={{__html: require(`../images/edgenote-${format}.svg`)}}
        />
      )
    }
  }

  returnLink() {
    if (this.props.params.chapter) {
      return `/${this.props.params.chapter}`
    } else {
      return `/edgenotes`
    }
  }

  closeModal() {
    if (this.props.history) {
      this.props.history.goBack()
    }
  }

  render() {
    let {caption} = this.state
    return (
      <div className="Modal">
        <Link 
          to={this.returnLink()}
          className="modalDismiss"
        >
          &nbsp;
        </Link>
        <header className="Modal-header">
          <Link
            to={this.returnLink()}
            className="modalClose"
            dangerouslySetInnerHTML={{__html: require("../images/modal-close.svg")}}
          />
          {this.renderFormatIcon()}
          <h4 dangerouslySetInnerHTML={caption} />
        </header>
        {this.renderModalContents()}
      </div>
    )
  }

}

export default ScrollLock(Modal)
