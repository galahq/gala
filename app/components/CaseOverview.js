import React from 'react';
import { Link } from 'react-router'
import TableOfContents from './TableOfContents.js'
import BillboardTitle from './BillboardTitle.js'
import {I18n} from './I18n.js'

export class Billboard extends React.Component {
  render() {
    let {title, metadata} = this.props.caseInfo
    return (
      <section className="Billboard">
        <BillboardTitle title={title} featuredImageURL={metadata.featuredImageURL} case_authors={metadata.case_authors} />
        <div className="Card BillboardSnippet">
          <h3><I18n meaning="summary" /></h3>
          {metadata.snippet}
        </div>
      </section>
    )
  }
}

class Actions extends React.Component {

  renderConsiderLinks() {
    if (this.props.caseInfo.metadata.consider_links && this.props.caseInfo.metadata.consider_links !== "") {
      return (
        <div>
          <h2>
            <div
              className="ActionIcon"
              dangerouslySetInnerHTML={{__html: require('../images/consider.svg')}}
            />
            <I18n meaning="consider"/>
          </h2>
          <div dangerouslySetInnerHTML={{__html: this.props.caseInfo.metadata.consider_links}} />
        </div>
      )
    }
  }

  renderPodcast() {
    if (this.props.caseInfo.metadata.has_podcast) {
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
          <a href={this.props.caseInfo.metadata.podcast_url}>
            {this.props.caseInfo.metadata.podcast_name}
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
            caseID={this.props.caseInfo.caseID}
            chapterTitles={this.props.caseInfo.chapterTitles}
            chapter={null}
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
        <Link to={`/read/${this.props.caseInfo.caseID}/edgenotes`}><I18n meaning="edgenote_gallery" /></Link>
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
        <Billboard caseInfo={this.props} />
        <Actions caseInfo={this.props} />
      </div>
    )
  }
}
