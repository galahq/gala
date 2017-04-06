import React from 'react'
import {Link} from 'react-router'

import {I18n} from 'I18n'
import Page from 'Page'

class Narrative extends React.Component {
  componentDidUpdate(prevProps) {
    if (prevProps.selectedPage === this.props.selectedPage)  return

    let top = document.getElementById('top');
    if (top && window.innerWidth < 749) {top.scrollIntoView()}
  }

  nextLink() {
    let nextChapterID = this.props.selectedPage + 2
    if (nextChapterID - 1 < this.props.pages.length) {
      return <Link className="nextLink" to={`/${nextChapterID}`}><I18n meaning="next" /> {this.props.pages[nextChapterID - 1].title}</Link>
    } else {
      return <footer><h2><I18n meaning="end" /></h2></footer>
    }
  }

  render() {
    let { selectedPage, pages } = this.props
    if (pages.length === 0) {
      return <article />
    }
    return (
      <main>
        <a id="top" />
        <Page
          id={pages[selectedPage].id}
        />
        {this.nextLink()}
      </main>
    )
  }
}

export default Narrative
