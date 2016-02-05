import React from 'react';
import TableOfContents from './TableOfContents.js'
import '../stylesheets/CaseOverview.scss'

class Billboard extends React.Component {
  render() {
    let {title, snippet, featuredImageURL} = this.props.caseInfo
    return (
      <section className="Billboard">
        <div className="BillboardTitle" style={{backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.0), rgba(0, 0, 0, 0.5)), url(${featuredImageURL})`}}>
          <h1>{title}</h1>
          <h4>Steven Yaffee, Julia Wondolleck, David Wang, and Sheena Vanleuven</h4>
        </div>
        <div className="Card BillboardSnippet">
          <h3>Case Summary</h3>
          {snippet}
          This case study details an active issue in the state of Michigan:
          whether or not to allow a public wolf hunt. The chairperson of the
          Michigan Natural Resources Commission, J.R. Richardson, faces a
          difficult decision. Once an endangered species, gray wolves have
          recovered in northern Michigan enough that some groups are pushing for
          a public wolf hunt. The Michigan Department of Natural Resources
          agrees and believes that a limited public hunt is scientifically and
          economically justified. But others are not convinced and have reacted
          with skepticism and hostility. What should the chairperson’s decision
          be? This case asks that you examine the issue from opposing, nuanced
          perspectives, and be guided by scientific, political, economic, and
          social analysis. Ultimately, you will be expected to make a
          responsible, sustainable policy recommendation on Michigan’s wolf
          population.
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
      <a href="http://www.hotinhere.us/podcast/ecology-of-fear-and-fear-of-ecology/">
        Ecology of Fear and Fear of Ecology — Can science do more to improve human–wildlife cohabitation?
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
