import React from 'react';
import mapNL from '../mapNL.js'
import {I18n} from './I18n.js'
import {Link} from 'react-router'

class Case extends React.Component {

  constructor() {
    super()
    this.state = {
      saved: true
    }
  }

  generateChapters(splits) {
    return splits.map( (split) => {

      var x = document.createElement('div');
      x.innerHTML = split[1];
      return mapNL(x.children, (para) => { return para } )
    } )
  }

  editing() {
    return this.props.location.pathname.slice(1,5) === "edit"
  }

  render() {
    let c = window.caseData

    let editStatusBar

    if (this.editing()) {
      editStatusBar = <div className="flash flash-editing">
                        <I18n meaning={"edit_instructions"} /> (
                        <I18n meaning={this.state.saved ? "saved" : "saving"} />)
                      </div>
    } else {
      editStatusBar = <div className="flash flash-info">
                        <I18n meaning='this_case_is_not_yet_published' /> —
                        <Link to={`/edit${this.props.location.pathname}`}>
                          <I18n meaning="edit_this_case" />
                        </Link>
                      </div>
    }

    return (
      <div id="Case">
        {editStatusBar}
        {this.props.children && React.cloneElement(this.props.children,
                                                  {
                                                    editing: (this.editing()),
                                                    slug: c.slug,
                                                    title: c.title,
                                                    caseAuthors: c.case_authors,
                                                    segmentTitles: c.segments.map( (x) => { return x[0] } ),
                                                    segmentContents: this.generateChapters(c.segments),
                                                    summary: c.summary,
                                                    coverURL: c.cover_url,
                                                    podcasts: c.podcasts,
                                                    activities: c.activities
                                                  })}
      </div>
    )
  }

}

export default Case
