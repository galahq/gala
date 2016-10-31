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

        <Editable placeholder="Snappy kicker" uri={`${endpoint}:kicker`} didSave={didSave}>
          <h6>{this.props.kicker}</h6>
        </Editable>

        <Editable placeholder="What is the central question of the case?" uri={`${endpoint}:title`} didSave={didSave}>
          <h1>
            {this.props.title}
          </h1>
        </Editable>

        {this.renderAuthors()}

        <Editable placeholder="Photo credit" uri={`${endpoint}:photo_credit`} didSave={didSave}>
          <cite className="o-bottom-right c-photo-credit">{this.props.photoCredit}</cite>
        </Editable>

      </div>
    )
  }
}

export default BillboardTitle
