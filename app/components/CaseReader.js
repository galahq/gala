import React from 'react';
import '../stylesheets/CaseReader.scss';

import mapNL from '../mapNL.js'
import fetchFromWP from '../wp-api.js'

import Sidebar from './Sidebar.js'
import Narrative from './Narrative.js'

String.prototype.trunc = String.prototype.trunc ||
  function(n){
    return (this.length > n) ? this.substr(0,n-1)+'...' : this;
  };

class CaseReader extends React.Component {

  constructor() {
    super()

    this.state = {
      title: '',
      chapters: []
    }
  }

  generateChapters(splits) {
    return splits.map( (split) => {

      var x = document.createElement('div');
      x.innerHTML = split;
      let title = x.querySelector('h1, h2, h3, h4, h5, h6').innerHTML
      return {title: title, contents: mapNL(x.children, (para) => { return para } )}
    } )
  }

  parseCaseFromJSON(response) {
    let chapters = this.generateChapters(response.content.rendered.split('<hr />'))
    this.setState({
      title: response.title.rendered,
      chapters: chapters
    })
  }

  componentDidMount() {
    fetchFromWP(this.props.params.id, this.parseCaseFromJSON.bind(this))
  }

  log(caseTitle, chapterNum, chapterTitle) {
    if (caseTitle)
    ga("set", "page", location.pathname)
    ga("send", "pageview", { "title": `${caseTitle.trunc(23)} ${chapterNum}: ${chapterTitle.trunc(20)}` })
  }

  render () {
    let {title, chapters} = this.state
    let chapterTitles = chapters.map((c) => {return c.title})
    let chapter= this.props.params.chapter || 0

    if (title !== "") {
      this.log(title, chapter, chapterTitles[chapter])
    }

    return (
      <div id="CaseReader">
        <Sidebar
          caseID={this.props.params.id}
          title={title}
          chapterTitles={chapterTitles}
          chapter={chapter}
        />
        <Narrative chapterTitles={chapterTitles} chapters={chapters} params={this.props.params} />
        {this.props.children}
      </div>
    )
  }
}
        //<Narrative chapters={chapters} chapter={chapter}/>

export default CaseReader
