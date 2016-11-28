import React from 'react'
import {findDOMNode} from 'react-dom'
import {Trackable} from 'concerns/trackable.js'
import {Statistics} from 'Statistics.js'
import Edgenote from 'Edgenote.js'
import {Link} from 'react-router'
import gatherEdgenotes from 'concerns/gatherEdgenotes.js';
import {I18n} from 'I18n.js'
import {Editable, EditableHTML} from 'Editable.js'
import {Orchard} from 'concerns/orchard.js'

class Narrative extends React.Component {
  componentDidMount() {
    if (this.props.didSave !== null) { return }

    $(document).on('keydown', (e) => {
      if (this.props.didSave !== null)  { return }
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
          reader={this.props.reader}
        />
        {this.nextLink()}
      </main>
    )
  }
}

export default Narrative

class Page extends Trackable {
  eventName() { return "visit_page" }

  trackableArgs() { return {
    case_slug: this.props.caseSlug,
    page_id: this.props.page.id,
    page_position: this.props.page.position
  } }

  newPropsAreDifferent(nextProps) {
    return this.props.page.id !== nextProps.page.id
  }

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
          reader={this.props.reader}
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

export class Card extends Trackable {
  eventName() { return "read_card" }
  trackableArgs() { return {
    case_slug: this.props.caseSlug,
    card_id: this.props.card.id
  } }
  newPropsAreDifferent(nextProps) {
    return this.props.card.id !== nextProps.card.id
  }

  isVisible(threshold, mode) {
    let elm = findDOMNode(this)
    threshold = threshold || 100;
    mode = mode || 'visible';

    let rect = elm.getBoundingClientRect();
    let viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
    let above = rect.bottom - threshold < 0;
    let below = rect.top - viewHeight + threshold >= 0;

    return mode === 'above' ? above : (mode === 'below' ? below : !above && !below);
  }

  checkVisibility() {
    if (!this.state.needsCheckVisibility) { return }

    if (this.isVisible()) {
      if (!this.state.visible) { this.startTimer() }
      this.setState({visible: true})
    } else {
      if (this.state.visible) { this.stopTimer() }
      this.setState({visible: false})
    }
    this.setState({ needsCheckVisibility: false })
  }

  constructor() {
    super()
    this.state = {
      selectedEdgenote: null,
      edgenoteSlugs: [],
      visible: false
    }

    this.setNeedsCheckVisibility = this.setNeedsCheckVisibility.bind(this)
  }

  componentWillMount() {
    window["handleHover"+this.props.i] = (slug) => {
      this.setState({selectedEdgenote: slug})
    }
  }

  setNeedsCheckVisibility() { this.setState({needsCheckVisibility: true}) }

  componentDidMount() {
    // Not calling super---overriding timer cues.
    window.addEventListener('scroll',  this.setNeedsCheckVisibility)

    this.setState({
      edgenoteSlugs: gatherEdgenotes(this.props.card.content),
      interval: setInterval(this.checkVisibility.bind(this), 1000)
    })

    this.setNeedsCheckVisibility()
  }

  componentWillUnmount() {
    // Not calling super---overriding timer cues.
    if (this.state.visible) { this.stopTimer() }
    window.removeEventListener('scroll',  this.setNeedsCheckVisibility)
    clearInterval(this.state.interval)
  }

  componentWillReceiveProps(nextProps) {
    let edgenoteSlugs = gatherEdgenotes(this.props.card.content)
    if (!edgenoteSlugs.every((e, i) => {
      return e === this.state.edgenoteSlugs[i]
    })) {
      this.setState({edgenoteSlugs: edgenoteSlugs})
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

  renderStats() {
    if (this.props.card.solid && this.props.didSave === null) {
      return <Statistics statistics={this.props.card.statistics} reader={this.props.reader} />
    }
  }

  render() {
    //let paragraph = this.props.contents.addAttributeToLinksPointingToEdgenoteID(this.state.selected_id, 'class="focus"')
    let paragraph = this.props.card.content
    return (
      <section>
        <div className={this.props.card.solid ? "Card" : "nonCard"}>
          {this.renderDeleteOption()}
          <EditableHTML uri={`cards/${this.props.card.id}:content`} placeholder="<!-- HTML content of card -->" didSave={this.props.didSave}>
            <div dangerouslySetInnerHTML={this.renderContent(paragraph)}>{paragraph}</div>
          </EditableHTML>
          {this.renderStats()}
        </div>
        {this.renderEdgenotes()}
      </section>
    )
  }
}
