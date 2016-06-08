import React from 'react';
import mapNL from '../mapNL.js'

class Case extends React.Component {

  generateChapters(splits) {
    return splits.map( (split) => {

      var x = document.createElement('div');
      x.innerHTML = split[1];
      return mapNL(x.children, (para) => { return para } )
    } )
  }

  render() {
    let c = window.caseData

    return (
      this.props.children && React.cloneElement(this.props.children,
                                                {
                                                  slug: c.slug,
                                                  title: c.title,
                                                  caseAuthors: c.case_authors,
                                                  segmentTitles: c.segments.map( (x) => { return x[0] } ),
                                                  segmentContents: this.generateChapters(c.segments),
                                                  summary: c.summary,
                                                  coverURL: c.cover_url
                                                })
    )
  }

}

export default Case
