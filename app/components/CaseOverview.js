import React from 'react';
import { Link } from 'react-router'
import TableOfContents from './TableOfContents.js'
import BillboardTitle from './BillboardTitle.js'
import '../stylesheets/CaseOverview.scss'

class Billboard extends React.Component {
  render() {
    let {title, metadata} = this.props.caseInfo
    return (
      <section className="Billboard">
        <BillboardTitle title={title} featuredImageURL={metadata.featuredImageURL} case_authors={metadata.case_authors} />
        <div className="Card BillboardSnippet">
          <h3>Case Summary</h3>
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
            Consider
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
            Listen
          </h2>
          <h4 className="list-head">Related podcast:</h4>
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
            Read
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
          Explore
        </h2>
        <Link to={`/read/${this.props.caseInfo.caseID}/edgenotes`}>Edgenote Gallery</Link>
      </div>

      {this.renderConsiderLinks()}

      <div>
        <h2>
          <div
            className="ActionIcon"
            dangerouslySetInnerHTML={{__html: require('../images/respond.svg')}}
          />
          Respond
        </h2>
        <a href="http://goo.gl/forms/32tzg5yZTd" target="_blank">Give us your feedback about this case.</a>
      </div>
    </aside>
    )
  }
}

class CaseOverview extends React.Component {
  render () {
    return (
      <div id="CaseOverview" className="window">
        <Billboard caseInfo={this.props} />
        <Actions caseInfo={this.props} />
      </div>
    )
  }
}

export default CaseOverview
