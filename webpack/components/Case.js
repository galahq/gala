import React from 'react';
import mapNL from '../mapNL.js'
import { orchard } from '../orchard.js'

class Case extends React.Component {

  constructor() {
    super()

    this.state = {
      title: '',
      chapters: [],
      metadata: {}
    }
  }

  generateChapters(splits) {
    return splits.map( (split) => {

      var x = document.createElement('div');
      x.innerHTML = split;
      let title = x.querySelector('h1, h2, h3, h4, h5, h6').innerHTML
      return {title: title, innerHTML: split, contents: mapNL(x.children, (para) => { return para } )}
    } )
  }

  parseCaseFromJSON(r) {
    //let chapters = this.generateChapters(response.content.rendered.split('<hr />'))
    this.setState({
      title: r.title,
      chapters: [{title: "Chapter", innerHTML: "", contents: [""]}],
      metadata: {
        snippet: r.summary,
        case_authors: r.case_authors,
        has_podcast: false,
        podcast_name: "",
        podcast_url: "",
        consider_links: "",
        featuredImageURL: r.cover_url
      }
    })
  }

  componentDidMount() {
    orchard(`cases/${window.params.slug}`).then(this.parseCaseFromJSON.bind(this))
  }

  render() {
    let {title, chapters, metadata} = this.state
    var chapterTitles = []
    if (chapters.length !== 0) {
      chapterTitles = chapters.map((c) => {return c.title})
    }

    return (
      this.props.children && React.cloneElement(this.props.children,
                                                {
                                                  caseID: window.params.slug,
                                                  title: title,
                                                  chapterTitles: chapterTitles,
                                                  chapters: chapters,
                                                  metadata: metadata
                                                })
    )
  }

}

export default Case
