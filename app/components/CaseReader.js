import React from 'react'
import { connect } from 'react-redux'

import Sidebar from 'Sidebar.js'
import Narrative from 'Narrative.js'

function mapStateToProps(state, {params}) {
  return {
    selectedPage: parseInt(params.selectedPage) - 1,
  }
}

const CaseReader = props => {
  let {editing,  pages, children, selectedPage} = props

  let pageTitles = pages.map( (p) => { return p.title } )

  return <div className={`window ${editing && 'editing'}`}>
  <Sidebar
    pageTitles={pageTitles}
    selectedPage={selectedPage}
    {...props}
  />
  <Narrative
    selectedPage={selectedPage}
    pages={pages}
  />
  {children &&
    React.cloneElement(children, props)}
  </div>

}

export default connect(mapStateToProps)(CaseReader)
