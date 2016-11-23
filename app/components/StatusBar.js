import React from 'react'
import {I18n} from 'I18n.js'
import {Link} from 'react-router'

export class StatusBar extends React.Component {

  link() {
    let path = this.props.location.pathname
    if (this.props.editing) {
      return{href: path.slice(5), meaning: "stop_editing_this_case"}
    } else {
      return {href: `edit${path}`, meaning: "edit_this_case"}
    }
  }

  renderMessage() {
    if (this.props.editing) {
      return <I18n meaning={this.props.saveMessage} />
    } else {
      return <I18n meaning="this_case_is_not_yet_published" />
    }
  }

  renderLink() {
    if (!this.props.reader.canUpdateCase) { return null }

    return <span>
      &ensp;&mdash;&ensp;
      <Link to={this.link().href}>
        <I18n meaning={this.link().meaning} />
      </Link>
    </span>
  }

  render() {
    return <div className={`flash flash-${this.props.editing ? "editing" : "info"}`}>
      { this.renderMessage() }
      { this.renderLink() }
    </div>
  }

}
