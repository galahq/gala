import React from 'react';
import TableOfContents from './TableOfContents.js'
import '../stylesheets/CaseOverview.scss'

class Billboard extends React.Component {
  render() {
    let {title, metadata} = this.props.caseInfo
    return (
      <section className="Billboard">
        <div className="BillboardTitle" style={{backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.0), rgba(0, 0, 0, 0.5)), url(${metadata.featuredImageURL})`}}>
          <h1>{title}</h1>
          <h4>{metadata.case_authors}</h4>
        </div>
        <div className="Card BillboardSnippet">
          <h3>Case Summary</h3>
          {metadata.snippet}
        </div>
      </section>
    )
  }
}

class Actions extends React.Component {
  render() {
    return (
      <aside className="Actions">

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

      <h2>
        <div
          className="ActionIcon"
          dangerouslySetInnerHTML={{__html: require('../images/explore.svg')}}
        />
        Explore
      </h2>
      <a href="#">Edgenote Gallery</a>

      <h2>
        <div
          className="ActionIcon"
          dangerouslySetInnerHTML={{__html: require('../images/consider.svg')}}
        />
        Consider
      </h2>
      <ul>
        <li><a href="#">Stakeholder perspectives</a></li>
        <li><a href="#">Apply your knowledge</a></li>
      </ul>

      <h2>
        <div
          className="ActionIcon"
          dangerouslySetInnerHTML={{__html: require('../images/respond.svg')}}
        />
        Respond
      </h2>
      <a href="#">Give us your feedback about this case.</a>
    </aside>
    )
  }
}

class CaseOverview extends React.Component {
  render () {
    return (
      <div id="CaseOverview">
        <Billboard caseInfo={this.props} />
        <Actions caseInfo={this.props} />
      </div>
    )
  }
}

export default CaseOverview
