import React from 'react'
import { connect  } from 'react-redux'
import {EditableText} from '@blueprintjs/core'

import {Trackable} from 'concerns/trackable.js'
import {Orchard} from 'concerns/orchard.js'
import { updatePage } from 'redux/actions.js'

import Card from 'Card.js'

function mapStateToProps(state, {id}) {
  return {
    caseSlug: state.caseData.slug,
    editing: state.edit.inProgress,
    ...state.pagesById[id],
  }
}

class Page extends Trackable {
  eventName() { return "visit_page" }

  trackableArgs() { return {
    case_slug: this.props.caseSlug,
    page_id: this.props.id,
    page_position: this.props.position,
  } }

  newPropsAreDifferent(nextProps) {
    return this.props.id !== nextProps.id
  }

  renderCreateCardLink(i) {
    if (this.props.editing) {
      return <CreateCardLink pageId={this.props.id} i={i}
        key={`create-${i}`} didSave={this.props.didSave} />
    }
  }

  render() {
    let {id, title, position, cards, caseSlug, editing, updatePage} = this.props


    return (
      <article>
        <section className="Page-meta">
          <h2 key={`h2:${id}`}>
            <EditableText placeholder="Page title" value={title}
              multiline
              disabled={!editing}
              onChange={value => updatePage(id, { title: value })}
            />
          </h2>
          { editing && <a className="Page-delete-option">Delete page</a> }
        </section>

        { cards.map( (id, i) => [
          this.renderCreateCardLink(i),
          <Card id={id} key={id} selectedPage={position}
            caseSlug={caseSlug} />,
        ]) }

        { this.renderCreateCardLink() } </article>
    )
  }
}

class CreateCardLink extends React.Component {
  createCard() {
    let { pageId, i} = this.props
    Orchard.graft(`pages/${pageId}/cards`, {position: i + 1})
      .then(setTimeout(() => location.reload(), 50))
  }

  render() {
    return <a onClick={this.createCard.bind(this)} className="Card-create">Create card</a>
  }
}

export default connect(mapStateToProps, { updatePage })(Page)

//deletePage() {
  //let confirmation = window.confirm("\
//Are you sure you want to delete this page and all of its cards?\n\n\
//Edgenotes attached to cards on this page will not be deleted.\n\n\
//This action cannot be undone.")
  //if (!confirmation) { return }

  //Orchard.prune(`pages/${this.props.page.id}`).then((response) => {
    ////this.props.didSave(response, true, 'deleted')
  //})

//}

