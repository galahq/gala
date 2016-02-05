import React from 'react';
import mapNL from '../mapNL.js'
import fetchFromWP from '../wp-api.js'

class Case extends React.Component {

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
      chapters: chapters,
      featuredImageURL: response.better_featured_image ? response.better_featured_image.source_url : ""
    })
  }

  componentDidMount() {
    fetchFromWP(this.props.params.id, this.parseCaseFromJSON.bind(this))
  }

  render() {
    let {title, chapters, featuredImageURL} = this.state
    var chapterTitles = []
    if (chapters.length !== 0) {
      chapterTitles = chapters.map((c) => {return c.title})
    }

    return (
      <div>
        {
          this.props.children && React.cloneElement(this.props.children,
                                                    {
                                                      caseID: this.props.params.id,
                                                      title: title,
                                                      chapterTitles: chapterTitles,
                                                      chapters: chapters,
                                                      featuredImageURL: featuredImageURL
                                                    })
        }
      </div>
    )
  }

}

export default Case
