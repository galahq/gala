import React, {PropTypes} from 'react'

import {Orchard} from 'concerns/orchard.js'

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
    let newContent = e.target.innerText

    let args = this.props.uri.split(':')
    if (args.length != 2) { throw URIError(`$(this.props.uri) is not a valid orchard reference`) }
    let endpoint = args[0]
    let attribute = args[1]

    let params = endpoint.split(/(.*)\//)
    let model = params[1].split('/').pop().slice(0, -1)

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

    let child = React.cloneElement(this.props.children, {
      contentEditable: this.editable(),
      onClick: this.clearPlaceholder.bind(this),
      onBlur: this.prepareSave.bind(this),
      children: grandchildren
    })

    return child
  }
}

Editable.propTypes = {
  placeholder: PropTypes.string,
  children: PropTypes.element.isRequired,
  didSave: PropTypes.func,
  uri: PropTypes.string.isRequired
}
