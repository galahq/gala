import React from 'react'
import '../stylesheets/Sidebar.scss'

class Sidebar extends React.Component {
  render () {
    let {title, sections} = this.props
    return (
      <aside id="Sidebar">
        <Headline caseTitle={title}/>
        <TableOfContents sections={sections}/>
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
  render() {
    return(
      <ol>
        <li>One</li>
        <li>Two</li>
      </ol>
    )
  }
}
