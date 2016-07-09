import React from 'react'

export class Editable extends React.Component {

  prepareSave() {

  }

  render() {
    let editable = this.props.handleEdit !== null

    return ( this.props.children && React.cloneElement(this.props.children, {
      contentEditable: editable
    }) )
  }

}
