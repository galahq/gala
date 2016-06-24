import React from 'react';

class BillboardTitle extends React.Component {
  renderAuthors() {
    let {caseAuthors} = this.props
    if (caseAuthors && caseAuthors !== "") {
      return <h4>{caseAuthors}</h4>
    }
  }
  render() {
    return (
      <div className="BillboardTitle" style={{backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.0), rgba(0, 0, 0, 0.5)), url(${this.props.coverURL})`}}>
        <h1 contentEditable={this.props.handleEdit !== null}>{this.props.title}</h1>
        {this.renderAuthors()}
      </div>
    )
  }
}

export default BillboardTitle
