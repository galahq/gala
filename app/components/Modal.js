import React from 'react'
import {Link} from 'react-router'

import fetchFromWP from '../wp-api.js'

import '../stylesheets/Modal.scss'

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
          contents: {__html: `<a href="${link}" target="_blank">Open in new tab.</a>`}
        })
      }
    } else {
      this.setState({
        contents: {__html: r.content.rendered}
      })
    }
  }

  componentDidMount() {
    fetchFromWP(this.props.params.edgenoteID, this.parseContentsFromJSON.bind(this))
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
        <aside className="Card">
          <Link
            to={this.returnLink()}
            className="modalClose"
            dangerouslySetInnerHTML={{__html: require("../images/modal-close.svg")}}
          />
          <div dangerouslySetInnerHTML={this.state.contents} />
        </aside>
      )
    }
  }

  returnLink() {
    if (this.props.params.chapter) {
      return `/read/${this.props.params.id}/${this.props.params.chapter}`
    } else {
      return `/read/${this.props.params.id}/edgenotes`
    }
  }

  render() {
    return (
      <div className="Modal">
        <Link to={this.returnLink()} className="modalDismiss">
          &nbsp;
        </Link>
        {this.renderModalContents()}
      </div>
    )
  }

}

export default Modal
