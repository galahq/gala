import React, {PropTypes} from 'react'
import { connect } from 'react-redux'
import {I18n} from 'I18n'
import {Orchard} from 'concerns/orchard'

function mapStateToProps(state) {
  return {
    editing: state.edit.inProgress,
  }
}

class EditableListClass extends React.Component {

  renderElements() {
    let {elements, selectedIndex, selectedClass} = this.props
    return elements.map((e, i) =>
      <li key={i} className={i === selectedIndex ? selectedClass : ""}>
        {e}
      </li>
                       )
  }

  addElement() {
    Orchard.graft(this.props.uri, {})
      .then(setTimeout(() => location.reload(), 50))
  }

  renderAddOption() {
    if (this.props.editing) {
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

export const EditableList = connect(mapStateToProps)(EditableListClass)

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
