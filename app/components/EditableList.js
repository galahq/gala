import React, {PropTypes} from 'react'
import {I18n} from 'I18n.js'
import {Orchard} from 'concerns/orchard.js'

export class EditableList extends React.Component {

  renderElements() {
    let {elements, selectedIndex, selectedClass} = this.props
    return elements.map((e, i) =>
      <li key={i} className={i === selectedIndex ? selectedClass : ""}>
        {e}
      </li>
                       )
  }

  addElement() {
    let args = this.props.uri.split(':')
    let endpoint = args[0]
    let attribute = args[1]

    if (attribute) {
      let params = endpoint.split(/(.*)\//)
      let model = params[1].split('/').pop().slice(0, -1)
      return
    } else {
      Orchard.graft(this.props.uri, {})
        .then((response) => {this.props.didSave(response)})
    }
  }

  renderAddOption() {
    if (this.props.didSave !== null) {
      return <li className="EditableList-add">
        <a onClick={this.addElement.bind(this)}><I18n meaning="create" /></a>
      </li>
    }
  }

  render() {
    let {ordered} = this.props
    let ListType = ordered ? "ol" : "ul"
    return (
      <ListType>
        {this.renderElements()}
        {this.renderAddOption()}
      </ListType>
    )
  }

}


EditableList.propTypes = {
  elements: PropTypes.arrayOf(PropTypes.element),
  ordered: PropTypes.bool,
  selectedIndex: PropTypes.number,
  selectedClass: PropTypes.string,
  uri: PropTypes.string.isRequired,
  didSave: PropTypes.func
}

EditableList.defaultProps = {
  elements: [],
  selectedIndex: -1
}
