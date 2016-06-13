import React from 'react';
import { Link } from 'react-router'
import TableOfContents from './TableOfContents.js'
import BillboardTitle from './BillboardTitle.js'
import {I18n} from './I18n.js'

export class Billboard extends React.Component {
  render() {
    let {title, coverURL, summary, caseAuthors} = this.props
    return (
      <section className="Billboard">
        <BillboardTitle title={title} coverURL={coverURL} caseAuthors={caseAuthors} />
        <div className="Card BillboardSnippet">
          <h3><I18n meaning="summary" /></h3>
          {summary}
        </div>
      </section>
    )
  }
}

class Actions extends React.Component {

  renderConsiderLinks() {
    let activities = this.props.activities
    if (activities && activities !== []) {
      return (
        <div>
          <h2>
            <div
              className="ActionIcon"
              dangerouslySetInnerHTML={{__html: require('../images/consider.svg')}}
            />
            <I18n meaning="consider"/>
          </h2>
          <div dangerouslySetInnerHTML={{__html: activities}} />
        </div>
      )
    }
  }

  renderPodcast() {
    let podcasts = this.props.podcasts
    if (podcasts && podcasts !== []) {
      return (
        <div>
          <h2>
            <div
              className="ActionIcon"
              dangerouslySetInnerHTML={{__html: require('../images/listen.svg')}}
            />
            <I18n meaning="listen" />
          </h2>
          <h4 className="list-head"><I18n meaning="related_podcast" /></h4>
          <a href={podcasts[0].audio_url}>
            {podcasts[0].title}
          </a>
        </div>
      )
    }
  }

  render() {
    return (
      <aside className="Actions">

        <div>
          <h2>
            <div
              className="ActionIcon"
              dangerouslySetInnerHTML={{__html: require('../images/read.svg')}}
            />
            <I18n meaning="read" />
          </h2>
          <TableOfContents
            slug={this.props.slug}
            segmentTitles={this.props.segmentTitles}
            currentSegment={null}
          />
        </div>

      {this.renderPodcast()}

      <div>
        <h2>
          <div
            className="ActionIcon"
            dangerouslySetInnerHTML={{__html: require('../images/explore.svg')}}
          />
          <I18n meaning="explore" />
        </h2>
        <Link to={`/edgenotes`}><I18n meaning="edgenote_gallery" /></Link>
      </div>

      {this.renderConsiderLinks()}

      <div>
        <h2>
          <div
            className="ActionIcon"
            dangerouslySetInnerHTML={{__html: require('../images/respond.svg')}}
          />
          <I18n meaning="respond" />
        </h2>
        <a href="http://goo.gl/forms/32tzg5yZTd" target="_blank"><I18n meaning="give_feedback" /></a>
      </div>
    </aside>
    )
  }
}

export class CaseOverview extends React.Component {
  render () {
    return (
      <div id="CaseOverview" className="window">
        <Billboard {...this.props} />
        <Actions {...this.props} />
      </div>
    )
  }
}
