import React from 'react'
import { connect  } from 'react-redux'
import {EditableText} from '@blueprintjs/core'

import {Orchard} from 'concerns/orchard'
import { updatePage } from 'redux/actions'

import Card from 'Card'

function mapStateToProps(state, {id}) {
  return {
    caseSlug: state.caseData.slug,
    editing: state.edit.inProgress,
    ...state.pagesById[id],
  }
}

function Page (props) {
  let {id, title, position, cards, caseSlug, editing, updatePage,
    deleteElement} = props

  return (
    <article>
      <section className="Page-meta">
        <h1 className="pt-dark" key={`h2:${id}`}>
          <EditableText
            placeholder="Page title"
            value={title}
            multiline
            disabled={!editing}
            onChange={value => updatePage(id, { title: value })}
          />
        </h1>
        {editing && <button
          type="button"
          className="c-delete-element pt-button pt-intent-danger pt-icon-trash"
          onClick={deleteElement}
        >
          Delete Page
        </button>}
      </section>

      { cards.map((cardId, i) => [
        props.editing && <CreateCardLink
          pageId={id}
          i={i}
          key={`create-${i}`}
        />,
        <Card
          id={cardId}
          key={cardId}
          selectedPage={position}
          caseSlug={caseSlug}
        />,
      ]) }

      { props.editing && <CreateCardLink
        pageId={id}
        key={`create-last`}
      /> }
    </article>
  )
}

class CreateCardLink extends React.Component {
  createCard() {
    let { pageId, i } = this.props
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
