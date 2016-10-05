import React from 'react'
import Edgenote from 'Edgenote.js'
import {Link} from 'react-router'
import gatherEdgenotes from 'concerns/gatherEdgenotes.js';
import {I18n} from 'I18n.js'
import {Editable, EditableHTML} from 'Editable.js'
import {Orchard} from 'concerns/orchard.js'

export function isElementInViewport (el) {

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
  componentDidMount() {
    if (this.props.didSave !== null) { return }

    $(document).on('keydown', (e) => {
      if (e.which === 37) {
        this.props.history.push(`/${Math.max(this.props.selectedPage, 1)}`)
      } else if (e.which === 39) {
        this.props.history.push(`/${Math.min(this.props.selectedPage + 2, this.props.pages.length)}`)
      }
    })
  }

  componentDidUpdate() {
    let top = document.getElementById('top');
    if (top && window.innerWidth < 749) {top.scrollIntoView()}
  }

  nextLink() {
    let nextChapterID = this.props.selectedPage + 2
    if (nextChapterID - 1 < this.props.pages.length) {
      let edit = this.props.didSave === null ? "" : 'edit/'
      return <Link className="nextLink" to={`/${edit}${nextChapterID}`}><I18n meaning="next" /> {this.props.pages[nextChapterID - 1].title}</Link>
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
          didSave={this.props.didSave}
          caseSlug={this.props.slug}
        />
        {this.nextLink()}
      </main>
    )
  }
}

export default Narrative

class Page extends React.Component {
  deletePage() {
    let confirmation = window.confirm("\
Are you sure you want to delete this page and all of its cards?\n\n\
Edgenotes attached to cards on this page will not be deleted.\n\n\
This action cannot be undone.")
    if (!confirmation) { return }

    Orchard.prune(`pages/${this.props.page.id}`).then((response) => {
      this.props.didSave(response, true, 'deleted')
    })

  }

  renderDeleteOption() {
    if (this.props.didSave !== null) {
      return <a onClick={this.deletePage.bind(this)} className="Page-delete-option">Delete page</a>
    }
  }

  renderCreateCardLink(i) {
    if (this.props.didSave !== null) {
      return <CreateCardLink pageId={this.props.page.id} i={i} didSave={this.props.didSave} />
    }
  }

  render() {
    let {page, didSave} = this.props

    var cards = page.cards.map( (card, i) => {
      return [
        this.renderCreateCardLink(i),
        <Card i={i} key={card.id}
          didSave={didSave}
          selectedPage={page.position}
          solid={card.solid}
          card={card}
          caseSlug={this.props.caseSlug}
        />
      ]
    } )
    cards.push(this.renderCreateCardLink())

    return (
      <article>
        <section className="Page-meta">
          <Editable placeholder="Page title" uri={`pages/${page.id}:title`} didSave={this.props.didSave}>
            <h1>{page.title}</h1>
          </Editable>
          {this.renderDeleteOption()}
        </section>
        {cards}
      </article>
    )
  }
}

class CreateCardLink extends React.Component {
  createCard() {
    let { pageId, i, didSave } = this.props
    Orchard.graft(`pages/${pageId}/cards`, {position: i + 1})
      .then((response) => {
        didSave(response)
      })
  }

  render() {
    return <a onClick={this.createCard.bind(this)} className="Card-create">Create card</a>
  }
}

export class Card extends React.Component {
  constructor() {
    super()
    this.state = {
      selectedEdgenote: null,
      edgenoteSlugs: []
    }
  }

  componentWillMount() {
    window["handleHover"+this.props.i] = (slug) => {
      this.setState({selectedEdgenote: slug})
    }
  }

  componentDidMount() {
    this.setEdgenotes(this.props.card.content)
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.didSave !== null ||
        this.props.selectedPage !== nextProps.selectedPage) {
      this.setState({ edgenoteSlugs: [] })
      this.setEdgenotes(nextProps.card.content)
    }
  }

  deleteCard() {
    let confirmation = window.confirm("\
Are you sure you want to delete this card and its contents?\n\n\
Edgenotes attached to it will not be deleted, although they will be detached.\n\n\
This action cannot be undone.")
    if (!confirmation) { return }

    Orchard.prune(`cards/${this.props.card.id}`).then((response) => {
      this.props.didSave(response, false, 'deleted')
    })
  }

  setEdgenotes(contents) {
    let edgenoteSlugs = gatherEdgenotes(contents)
    this.setState({edgenoteSlugs: edgenoteSlugs})
  }

  addAttributeToLinks(content, attribute) {
    return content.replace(/(data-edgenote=\"([a-zA-Z0-9-]+)\")/g, '$1 ' + attribute)
  }

  addHoverCallbacks(content) {
    let mouseover = 'onmouseover=\'window.handleHover'+this.props.i+'(\"$2\")\''
    content = this.addAttributeToLinks(content, mouseover)
    let mouseout = 'onmouseout=\'window.handleHover'+this.props.i+'(null)\''
    content = this.addAttributeToLinks(content, mouseout)
    return content
  }

  addHREF(content, firstPartOfPath) {
    return this.addAttributeToLinks(content, `href=\"#${firstPartOfPath || ""}/edgenotes/$2\"`)
  }

  renderCitations(content) {
    return content.replace(/(<cite>.+?<\/cite>)/g, '<span class="citation" onclick="toggleCitation(event)"><span class="citation-label"><sup>◦</sup></span>$1</span>')
  }

  renderContent() {
    var {content} = this.props.card
    content = this.addHoverCallbacks(content)
    content = this.addHREF(content, this.props.selectedPage && `/${this.props.selectedPage}`)
    content = this.renderCitations(content)
    return { __html: content }
  }

  renderEdgenotes() {
    let edit = this.props.didSave !== null ? "/edit" : ""
    let aside
    if (this.state.edgenoteSlugs.length != 0) {
      aside = <aside className="edgenotes">
                {
                  this.state.edgenoteSlugs.map( (slug) => {
                    return (
                      <Edgenote
                        pathPrefix={this.props.selectedPage && `${edit}/${this.props.selectedPage}`}
                        selectedEdgenote={this.state.selectedEdgenote}
                        slug={slug}
                        key={`edgenote_${slug}`}
                        handleHoverID={this.props.i}
                        didSave={this.props.didSave}
                        caseSlug={this.props.caseSlug}
                      />
                      )
                    } )
                }
              </aside>
    }
    return aside
  }

  renderDeleteOption() {
    if (this.props.didSave !== null) {
      return <a onClick={this.deleteCard.bind(this)} className="Card-delete-option">Delete card</a>
    }
  }

  render() {
    //let paragraph = this.props.contents.addAttributeToLinksPointingToEdgenoteID(this.state.selected_id, 'class="focus"')
    let paragraph = this.props.card.content
    return (
      <section>
        <div className={this.props.card.solid ? "Card" : ""}>
          {this.renderDeleteOption()}
          <EditableHTML uri={`cards/${this.props.card.id}:content`} placeholder="<!-- HTML content of card -->" didSave={this.props.didSave}>
            <div dangerouslySetInnerHTML={this.renderContent(paragraph)}>{paragraph}</div>
          </EditableHTML>
        </div>
        {this.renderEdgenotes()}
      </section>
    )
  }
}
