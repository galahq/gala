/**
 * @providesModule Page
 * @flow
 */

import React from 'react'
import { connect } from 'react-redux'
import { EditableText } from '@blueprintjs/core'

import { Orchard } from 'shared/orchard'
import { updatePage } from 'redux/actions'

import Edgenotes from 'edgenotes'
import Card from 'card'

import type { State, Page as PageT } from 'redux/state'

type OwnProps = { id: string, deleteElement: () => void }
function mapStateToProps (state: State, { id }: OwnProps) {
  return {
    editing: state.edit.inProgress,
    ...state.pagesById[id],
  }
}

type Props = OwnProps &
  PageT & {
    editing: boolean,
    updatePage: (id: string, data: $Shape<PageT>) => mixed,
  }
const Page = (props: Props) => {
  let { id, title, cards, editing, updatePage, deleteElement } = props

  return (
    <article>
      <section className="Page-meta">
        <h1 className="pt-dark" key={`h2:${id}`}>
          <EditableText
            multiline
            placeholder="Page title"
            value={title}
            disabled={!editing}
            onChange={(value: string) => updatePage(id, { title: value })}
          />
        </h1>
        {editing &&
          <button
            type="button"
            className="c-delete-element pt-button pt-intent-danger pt-icon-trash"
            onClick={deleteElement}
          >
            Delete Page
          </button>}
      </section>

      {cards.map((cardId, i) => [
        props.editing &&
          <CreateCardLink pageId={id} i={i} key={`create-${i}`} />,
        <section key={cardId}>
          <Card id={cardId} />
          <Edgenotes cardId={cardId} />
        </section>,
      ])}

      {props.editing && <CreateCardLink pageId={id} key={`create-last`} />}
    </article>
  )
}

class CreateCardLink extends React.Component {
  props: {
    pageId: string,
    i?: number,
  }

  handleCreateCard = () => {
    // TODO: This should really be in a redux thun
    let { pageId, i } = this.props
    Orchard.graft(`pages/${pageId}/cards`, { position: i + 1 }).then(() =>
      setTimeout(() => location.reload(), 50)
    )
  }

  render () {
    return (
      <a className="Card-create" onClick={this.handleCreateCard}>
        Create card
      </a>
    )
  }
}

export default connect(mapStateToProps, { updatePage })(Page)
