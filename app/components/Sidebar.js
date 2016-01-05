import React from 'react'

class Sidebar extends React.Component {
  render () {
    return (
      <aside id="Sidebar">
        <Headline caseTitle={this.props.title}/>
        <TableOfContents chapterTitles={this.props.chapterTitles} chapter={this.props.chapter}/>
      </aside>
    )
  }
}

export default Sidebar

class Headline extends React.Component {
  render() { return (
    <div id="Headline">
      <h2>{this.props.caseTitle}</h2>
    </div>
  ) }
}

class TableOfContents extends React.Component {
  renderChapterTitles() {
    let titleList = this.props.chapterTitles.map( (title, idx) => {
      return(
        <li className={idx === this.props.chapter ? "focus" : ""}>
          <a href="#">{title}</a>
        </li>
      )
    } )
    return titleList
  }
  render() {
    return(
      <div id="TableOfContents">
        <h4>Table of Contents</h4>
        <ol>
          {this.renderChapterTitles()}
        </ol>
      </div>
    )
  }
}
