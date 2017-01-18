import React from 'react'
import {Editable} from 'Editable.js'
import {EditableText} from '@blueprintjs/core'
import {Orchard} from 'concerns/orchard.js'

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

        <h6>
          <EditableText defaultValue={this.props.kicker} disabled={!didSave}
            placeholder="Snappy kicker"
            onConfirm={value => Orchard.espalier(endpoint, { "case": { kicker: value } }).then( r => didSave(r) )}
          />
        </h6>

        <h1>
          <EditableText multiline defaultValue={this.props.title} disabled={!didSave}
            placeholder="What is the central question of the case?"
            onConfirm={value => Orchard.espalier(endpoint, { "case": { title: value } }).then( r => didSave(r) )}
          />
        </h1>

        {this.renderAuthors()}

        <cite className="o-bottom-right c-photo-credit">
          <EditableText defaultValue={this.props.photoCredit} disabled={!didSave}
            placeholder={ !!didSave && "Photo credit" }
            onConfirm={value => Orchard.espalier(endpoint, { "case":  { photo_credit: value } }).then( r => didSave(r) )}
          />
        </cite>

      </div>
    )
  }
}

export default BillboardTitle
