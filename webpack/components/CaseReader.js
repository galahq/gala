import React from 'react';

import Sidebar from './Sidebar.js'
import Narrative from './Narrative.js'

String.prototype.trunc = String.prototype.trunc ||
  function(n){
    return (this.length > n) ? this.substr(0,n-1)+'...' : this;
  };

class CaseReader extends React.Component {

  log(caseTitle, chapterNum, chapterTitle) {
    if (window.ga && caseTitle) {
      window.ga("set", "page", location.pathname)
      window.ga("send", "pageview", { "title": `${caseTitle.trunc(23)} ${chapterNum}: ${chapterTitle.trunc(20)}` })
    }
  }

  render () {
    let {title, pages, handleEdit} = this.props
    let selectedPage = parseInt(this.props.params.selectedPage) - 1

    let pageTitles = this.props.pages.map( (p) => { return p.title } )

    if (title !== "") {
      this.log(title, selectedPage, pageTitles[selectedPage])
    }

    return (
      <div className={`window ${handleEdit !== null ? 'editing' : ''}`}>
        <Sidebar
          pageTitles={pageTitles}
          selectedPage={selectedPage}
          {...this.props}
        />
        <Narrative
          pages={pages}
          selectedPage={selectedPage}
          handleEdit={handleEdit}
        />
        {this.props.children}
      </div>
    )
  }
}
        //<Narrative chapters={chapters} chapter={chapter}/>

export default CaseReader
