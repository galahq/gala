import React from 'react'
import {Editable} from 'Editable.js'

class BillboardTitle extends React.Component {
  renderTranslators() {
    if (this.props.translators !== "") {
      return <em>{this.props.translators}</em>
    }
  }

  renderAuthors() {
    let {caseAuthors} = this.props
    if (caseAuthors && caseAuthors !== "") {
      return (<h4>
        {caseAuthors}
        <br />
        {this.renderTranslators()}
      </h4>)
    }
  }

  render() {
    let endpoint = `cases/${this.props.slug}`
    let {didSave} = this.props
    return (
      <div className="BillboardTitle" style={{backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.0), rgba(0, 0, 0, 0.5)), url(${this.props.coverUrl})`}}>

        <Editable uri={`${endpoint}:kicker`} didSave={didSave}>
          <h6>{this.props.kicker}</h6>
        </Editable>

        <h1>
          <Editable uri={`${endpoint}:title`} didSave={didSave}>
            <span>{this.props.title}</span>
          </Editable>
        </h1>

        {this.renderAuthors()}

        <Editable uri={`${endpoint}:photoCredit`} didSave={didSave}>
          <cite dangerouslySetInnerHTML={{__html: this.props.photoCredit}} />
        </Editable>

      </div>
    )
  }
}

export default BillboardTitle
