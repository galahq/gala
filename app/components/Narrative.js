import React from 'react'
import {findDOMNode} from 'react-dom'
import {Trackable} from 'concerns/trackable.js'
import {EditableText} from '@blueprintjs/core'
import {Link} from 'react-router'

import EdgenotesCard from 'EdgenotesCard.js'
import CardContents from 'CardContents.js'
import {I18n} from 'I18n.js'
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
    let {edgenotes, didSave, slug, reader} = this.props
    return (
      <main>
        <a id="top" />
        <Page
          page={page}
          edgenotes={edgenotes}
          didSave={didSave}
          caseSlug={slug}
          reader={reader}
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
    page_position: this.props.page.position,
  } }

  newPropsAreDifferent(nextProps) {
    return this.props.page.id !== nextProps.page.id
  }

  constructor(props) {
    super(props)
    this.state = {selectedEdgenote: null}
  }

  componentWillMount() {
    window.handleEdgenoteHover = (slug) => {
      this.setState({selectedEdgenote: slug})
    }
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
      return <CreateCardLink pageId={this.props.page.id} i={i} key={`create-${i}`} didSave={this.props.didSave} />
    }
  }

  render() {
    let {page, didSave, caseSlug, edgenotes, reader} = this.props

    var cards = page.cards.map( (card, i) => {
      return [
        this.renderCreateCardLink(i),
        <Card id={card.id} key={card.id}
          didSave={didSave}
          selectedPage={page.position}
          solid={card.solid}
          card={card}
          caseSlug={caseSlug}
          edgenotes={edgenotes}
          selectedEdgenote={this.state.selectedEdgenote}
          reader={reader}
        />,
      ]
    } )
    cards.push(this.renderCreateCardLink())

    return (
      <article>
        <section className="Page-meta">
          <h2 key={`h2:${page.id}`}>
            <EditableText multiline placeholder="Page title" defaultValue={page.title} disabled={!didSave}
              onConfirm={value => Orchard.espalier(`pages/${page.id}`, { page: { title: value } }).then( r => didSave(r) )}
            />
          </h2>
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
    card_id: this.props.card.id,
  } }
  newPropsAreDifferent(nextProps) {
    return this.props.id !== nextProps.id
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
      visible: false,
    }

    this.setNeedsCheckVisibility = this.setNeedsCheckVisibility.bind(this)
  }

  setNeedsCheckVisibility() { this.setState({needsCheckVisibility: true}) }

  componentDidMount() {
    // Not calling super---overriding timer cues.
    window.addEventListener('scroll',  this.setNeedsCheckVisibility)

    this.setState({
      interval: setInterval(this.checkVisibility.bind(this), 1000),
    })

    this.setNeedsCheckVisibility()
  }

  componentWillUnmount() {
    // Not calling super---overriding timer cues.
    if (this.state.visible) { this.stopTimer() }
    window.removeEventListener('scroll',  this.setNeedsCheckVisibility)
    clearInterval(this.state.interval)
  }

  render() {
    return (
      <section>
        <CardContents id={this.props.card.id} didSave={this.props.didSave} />
        <EdgenotesCard
          cardId={this.props.card.id}
          caseSlug={this.props.caseSlug}
          selectedPage={this.props.selectedPage}
          didSave={this.props.didSave}
        />
      </section>
    )
  }
}
