import React from 'react';
import {Link} from 'react-router'
import {orchard} from '../orchard.js'

import BillboardTitle from './BillboardTitle.js'


class Catalog extends React.Component {

  constructor() {
    super()

    this.state = {
      cases: []
    }
  }

  parseJSON(r) {
    let caseObjects = r.map( (c) => {
      return ({
        id: c.slug,
        title: c.title,
        case_authors: c.case_authors,
        featuredImageURL: c.cover_url
      })
    } )
    this.setState( {cases: caseObjects} )
  }

  componentDidMount() {
    orchard('cases').then((r) => { this.parseJSON(r) })
  }

  renderCatalog() {
    let billboards = this.state.cases.map( (c) => {
      return (
        <Link to={`/read/${c.id}`}>
          <BillboardTitle title={c.title} case_authors={c.case_authors} featuredImageURL={c.featuredImageURL} />
        </Link>
      )
    })
    return (billboards)
  }

  render() {
    return (
      <div id="Catalog" className="window">
        <div>
          {this.renderCatalog()}
        </div>
      </div>
    )
  }
}

export default Catalog
