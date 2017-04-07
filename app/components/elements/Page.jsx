import React from 'react'
import { connect } from 'react-redux'
import { EditableText } from '@blueprintjs/core'

import { Orchard } from 'shared/orchard'
import { updatePage } from 'redux/actions'

import Card from 'cards/Card'

import type { State } from 'redux/state'

type OwnProps = { id: string }
function mapStateToProps (state: State, { id }: OwnProps) {
  return {
    caseSlug: state.caseData.slug,
    editing: state.edit.inProgress,
    ...state.pagesById[id],
  }
}

const Page = (props) => {
  let {
    id,
    title,
    position,
    cards,
    caseSlug,
    editing,
    updatePage,
    deleteElement,
  } = props

  return (
    <article>
      <section className="Page-meta">
        <h1 className="pt-dark" key={`h2:${id}`}>
          <EditableText
            placeholder="Page title"
            value={title}
            multiline
            disabled={!editing}
            onChange={(value: string) => updatePage(id, { title: value })}
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

      <CreateCardLink
        pageId={id}
        key={`create-last`}
      />
    </article>
  )
}

class CreateCardLink extends React.Component {
  createCard () {
    // TODO: This should really be in a redux thun
    let { pageId, i } = this.props
    Orchard.graft(`pages/${pageId}/cards`, { position: i + 1 })
      .then(setTimeout(() => location.reload(), 50))
  }

  render () {
    return <a onClick={this.createCard.bind(this)} className="Card-create">
      Create card
    </a>
  }
}

export default connect(mapStateToProps, { updatePage })(Page)
