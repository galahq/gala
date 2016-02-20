import React from 'react';
import '../stylesheets/CaseReader.scss';


import Sidebar from './Sidebar.js'
import Narrative from './Narrative.js'

String.prototype.trunc = String.prototype.trunc ||
  function(n){
    return (this.length > n) ? this.substr(0,n-1)+'...' : this;
  };

class CaseReader extends React.Component {

  log(caseTitle, chapterNum, chapterTitle) {
    if (caseTitle)
    ga("set", "page", location.pathname)
    ga("send", "pageview", { "title": `${caseTitle.trunc(23)} ${chapterNum}: ${chapterTitle.trunc(20)}` })
  }

  render () {
    let {title, chapters, chapterTitles, metadata} = this.props
    let chapter= this.props.params.chapter || 0

    if (title !== "") {
      this.log(title, chapter, chapterTitles[chapter])
    }

    return (
      <div id="CaseReader" className="window">
        <Sidebar
          caseID={this.props.params.id}
          title={title}
          chapterTitles={chapterTitles}
          chapter={chapter}
          metadata={metadata}
        />
        <Narrative chapterTitles={chapterTitles} chapters={chapters} params={this.props.params} />
        {this.props.children}
      </div>
    )
  }
}
        //<Narrative chapters={chapters} chapter={chapter}/>

export default CaseReader
