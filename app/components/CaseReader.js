import React from 'react';
import '../stylesheets/CaseReader.scss';

import mapNL from '../mapNL.js'

import Narrative from './Narrative.js'
import Sidebar from './Sidebar.js'

class CaseReader extends React.Component {

  constructor() {
    super()

    this.state = {
      title: '',
      chapters: [],
      chapter: 0
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
    return({
      title: response.title.rendered,
      chapters: chapters
    })
  }

  componentDidMount() {
    $.ajax({
      type: 'GET',
      url: 'http://remley.wcbn.org/ihih-msc/index.php',
      data: [
        {name: 'rest_route', value: `/wp/v2/posts/${this.props.id}`}
      ],
      dataType: 'json',
      success: (response) => {
        this.setState(this.parseCaseFromJSON(response))
      }
    })
  }

  render () {
    let {title, chapters, chapter} = this.state
    let chapterTitles = chapters.map((c) => {return c.title})
    return (
      <div id="CaseReader">
        <header>
          <h1 id="logo">MSC Logo</h1>
        </header>
        <Sidebar
          title={title}
          chapterTitles={chapterTitles}
          chapter={chapter}
        />
        <Narrative chapters={chapters} chapter={chapter}/>
      </div>
    )
  }
}

export default CaseReader
