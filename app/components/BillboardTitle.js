import React from 'react';
import '../stylesheets/CaseOverview.scss'

class BillboardTitle extends React.Component {
  renderAuthors() {
    if (this.props.case_authors && this.props.case_authors !== "") {
      return <h4>{this.props.case_authors}</h4>
    }
  }
  render() {
    return (
      <div className="BillboardTitle" style={{backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.0), rgba(0, 0, 0, 0.5)), url(${this.props.featuredImageURL})`}}>
        <h1>{this.props.title}</h1>
        {this.renderAuthors()}
      </div>
    )
  }
}

export default BillboardTitle
