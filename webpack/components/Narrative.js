import React from 'react'
import Edgenote from './Edgenote.js'
import {Link} from 'react-router'
import gatherEdgenotes from '../gatherEdgenotes.js';
import {I18n} from './I18n.js'

function isElementInViewport (el) {

  //special bonus for those using jQuery
  if (typeof jQuery === "function" && el instanceof jQuery) {
    el = el[0];
  }

  var rect = el.getBoundingClientRect();

  return (
    rect.top >= 0 &&
      rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /*or $(window).height() */
        rect.right <= (window.innerWidth || document.documentElement.clientWidth) /*or $(window).width() */
  );
}

class Narrative extends React.Component {
  componentDidUpdate() {
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
    let i = this.props.selectedPage
    if (this.props.pages.length === 0) {
      return <article />
    }
    let page = this.props.pages[i]
    return (
      <main>
        <a id="top" />
        <Page
          page={page}
          handleEdit={this.props.handleEdit}
        />
        {this.nextLink()}
      </main>
    )
  }
}

export default Narrative

class Page extends React.Component {
  render() {
    let {page} = this.props
    let cards = page.cards.map( (card, i) => {
      return <Card id={i} key={`c${i}`}
                   handleEdit={this.props.handleEdit}
                   selectedPage={page.position}
                   solid={card.solid}
                   card={card} />
    } )

    return (
      <article>
        <section><h1>{page.title}</h1></section>
        {cards}
      </article>
    )
  }
}

String.prototype.addAttributeToLinks = function (attribute) {
  return this.replace(/(data-edgenote=\"([a-zA-Z0-9-]+)\")/g, '$1 ' + attribute)
}

String.prototype.addAttributeToLinksPointingToEdgenoteID = function (id, attribute) {
  return this.replace(new RegExp('(data-edgenote=\"'+id+'\")', 'g'), '$1 ' + attribute)
}

String.prototype.addHREF = function(firstPartOfPath) {
  return this.addAttributeToLinks(`href=\"#${firstPartOfPath}/edgenotes/$2\"`)
}

class Card extends React.Component {
  constructor() {
    super()
    this.state = {
      selectedEdgenote: null,
      edgenoteSlugs: []
    }
  }

  addHoverCallbacksToParagraphText(paragraph) {
    let mouseover = 'onmouseover=\'window.handleHover'+this.props.id+'(\"$2\")\''
    let mouseout = 'onmouseout=\'window.handleHover'+this.props.id+'(null)\''
    return { __html: paragraph.addAttributeToLinks(mouseover).addAttributeToLinks(mouseout)
      .addHREF(`/${this.props.selectedPage}`) }
  }

  setEdgenotes(contents) {
    let edgenoteSlugs = gatherEdgenotes(contents)
    this.setState({edgenoteSlugs: edgenoteSlugs})
  }

  componentWillMount() {
    window["handleHover"+this.props.id] = (slug) => {
      this.setState({selectedEdgenote: slug})
    }
  }

  componentDidMount() {
    this.setEdgenotes(this.props.card.content)
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.selectedPage !== nextProps.selectedPage) {
      this.setState({ edgenoteSlugs: [] })
      this.setEdgenotes(nextProps.card.content)
    }
  }

  renderEdgenotes() {
    let aside
    if (this.state.edgenoteSlugs.length != 0) {
      aside = <aside className="edgenotes">
                {
                  this.state.edgenoteSlugs.map( (slug) => {
                    return (
                      <Edgenote
                        pathPrefix={`/${this.props.selectedPage}`}
                        selectedEdgenote={this.state.selectedEdgenote}
                        slug={slug}
                        key={`edgenote_${slug}`}
                        handleHoverID={this.props.id}
                      />
                      )
                    } )
                }
              </aside>
    }
    return aside
  }

  prepareSave() {}

  render() {
    //let paragraph = this.props.contents.addAttributeToLinksPointingToEdgenoteID(this.state.selected_id, 'class="focus"')
    let paragraph = this.props.card.content
    return (
      <section>
        <div className={this.props.card.solid ? "Card" : ""}
          contentEditable={this.props.handleEdit !== null}
          dangerouslySetInnerHTML={this.addHoverCallbacksToParagraphText(paragraph)}
          onBlur={this.prepareSave.bind(this)} />
        {this.renderEdgenotes()}
      </section>
    )
  }
}
