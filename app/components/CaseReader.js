import React from 'react'
import { connect } from 'react-redux'

import Sidebar from 'Sidebar.js'
import Narrative from 'Narrative.js'

function mapStateToProps(state) {
  return {
    editing: state.edit.inProgress,
  }
}

const CaseReader = props => {
  let {editing, params, pages, children} = props
  let selectedPage = parseInt(params.selectedPage) - 1

  let pageTitles = pages.map( (p) => { return p.title } )

  return <div className={`window ${editing && 'editing'}`}>
  <Sidebar
    pageTitles={pageTitles}
    selectedPage={selectedPage}
    {...props}
  />
  <Narrative
    selectedPage={selectedPage}
    {...props}
  />
  {children &&
    React.cloneElement(children, props)}
  </div>

}

export default connect(mapStateToProps)(CaseReader)
