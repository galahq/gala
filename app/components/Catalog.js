import React from 'react';
import {Link} from 'react-router'
import fetchFromWP from '../wp-api.js'

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
        id: c.id,
        title: c.title.rendered,
        case_authors: c.acf.case_authors,
        featuredImageURL: c.better_featured_image ? c.better_featured_image.source_url : ""
      })
    } )
    this.setState( {cases: caseObjects} )
  }

  componentDidMount() {
    let params = {onlyMainText: true}
    fetchFromWP(params, this.parseJSON.bind(this))
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
