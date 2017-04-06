import React, {PropTypes} from 'react'

import {Orchard} from 'concerns/orchard'

export class Editable extends React.Component {
  editable() { return this.props.didSave !== null }
  shouldHoldPlace() {
    return this.editable() && (
      this.props.children.props.children === "" ||
      this.props.children.props.children === null
    )
  }

  clearPlaceholder(e) {
    if (this.shouldHoldPlace()) {
      e.target.innerText = ""
      e.target.focus()
    }
  }

  prepareSave(e) {
    if (!this.editable()) { return }

    let newContent = e.target.innerText

    let args = this.props.uri.split(':')
    if (args.length != 2) { throw URIError(`$(this.props.uri) is not a valid orchard reference`) }
    let endpoint = args[0]
    let attribute = args[1]

    let params = endpoint.split(/(.*)\//)
      let model = params[1].split('/').pop().slice(0, -1).replace(/ie$/, 'y')

    let object = {
      [`${model}`]: {
        [`${attribute}`]: newContent
      }
    }

    Orchard.espalier(endpoint, object)
      .then((response) => { this.props.didSave(response) })
  }

  render() {
    let {placeholder, children} = this.props

    let grandchildren = this.shouldHoldPlace() ? placeholder : children.props.children

    return React.cloneElement(this.props.children, {
      contentEditable: this.editable(),
      onClick: this.clearPlaceholder.bind(this),
      onBlur: this.prepareSave.bind(this),
      children: grandchildren
    })
  }
}

Editable.propTypes = {
  placeholder: PropTypes.string,
  children: PropTypes.element.isRequired,
  didSave: PropTypes.func,
  uri: PropTypes.string.isRequired
}

export class EditableHTML extends Editable {

  shouldHoldPlace() {
    return this.editable() && (
      this.props.children.props.dangerouslySetInnerHTML.__html === "" ||
      this.props.children.props.dangerouslySetInnerHTML.__html === null
    )
  }

  render() {
    let children = this.editable()
      ? this.props.children.props.children || this.props.children.props.dangerouslySetInnerHTML.__html
      : null
    let dangerouslySetInnerHTML = this.editable() ? null : this.props.children.props.dangerouslySetInnerHTML

    return React.cloneElement(this.props.children, {
      contentEditable: this.editable(),
      onClick: this.clearPlaceholder.bind(this),
      onBlur: this.prepareSave.bind(this),
      children: this.shouldHoldPlace() ? this.props.placeholder : children,
      dangerouslySetInnerHTML: dangerouslySetInnerHTML,
      className: this.editable() ? `${this.props.children.props.className || ""} EditableHTML-editing` : this.props.children.props.className
    })
  }

}

export class EditableAttribute extends Editable {

  render() {
    if (this.editable()) {
      return <div className="EditableAttribute">
        <label>{this.props.placeholder}: </label>
        <span contentEditable={true} onBlur={this.prepareSave.bind(this)}>{this.props.children}</span>
      </div>
    } else {
      return <span />
    }
  }

}
