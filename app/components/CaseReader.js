import React from 'react';

import Sidebar from 'Sidebar.js'
import Narrative from 'Narrative.js'

String.prototype.trunc = String.prototype.trunc ||
  function(n){
    return (this.length > n) ? this.substr(0,n-1)+'...' : this;
  };

class CaseReader extends React.Component {

  render () {
    let {didSave} = this.props
    let selectedPage = parseInt(this.props.params.selectedPage) - 1

    let pageTitles = this.props.pages.map( (p) => { return p.title } )

    return (
      <div className={`window ${didSave !== null ? 'editing' : ''}`}>
        <Sidebar
          pageTitles={pageTitles}
          selectedPage={selectedPage}
          {...this.props}
        />
        <Narrative
          selectedPage={selectedPage}
          {...this.props}
        />
        {this.props.children &&
          React.cloneElement(this.props.children, this.props)}
      </div>
    )
  }
}
        //<Narrative chapters={chapters} chapter={chapter}/>

export default CaseReader
