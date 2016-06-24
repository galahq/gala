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
    let {slug, coverURL, title, segmentContents, segmentTitles, handleEdit} = this.props
    let selectedSegment = parseInt(this.props.params.selectedSegment) - 1

    if (title !== "") {
      this.log(title, selectedSegment, segmentTitles[selectedSegment])
    }

    return (
      <div className={`window ${handleEdit !== null ? 'editing' : ''}`}>
        <Sidebar
          slug={slug}
          coverURL={coverURL}
          title={title}
          segmentTitles={segmentTitles}
          selectedSegment={selectedSegment}
          handleEdit={handleEdit}
        />
        <Narrative
          segmentTitles={segmentTitles}
          segmentContents={segmentContents}
          selectedSegment={selectedSegment}
          handleEdit={handleEdit}
        />
        {this.props.children}
      </div>
    )
  }
}
        //<Narrative chapters={chapters} chapter={chapter}/>

export default CaseReader
