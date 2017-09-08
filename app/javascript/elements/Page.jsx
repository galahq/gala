/**
 * @providesModule Page
 * @flow
 */

import React from 'react'
import styled from 'styled-components'
import { connect } from 'react-redux'
import { Button, EditableText } from '@blueprintjs/core'

import { updatePage, createCard } from 'redux/actions'

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
    updatePage: typeof updatePage,
    createCard: typeof createCard,
  }
const Page = (props: Props) => {
  let {
    id,
    title,
    cards,
    editing,
    updatePage,
    deleteElement,
    createCard,
  } = props

  return (
    <article className="pt-dark">
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
          <CreateCardLink
            pageId={id}
            i={i}
            key={`create-${i}`}
            createCard={createCard}
          />,
        <section key={cardId}>
          <Card id={cardId} />
          <Edgenotes cardId={cardId} />
        </section>,
      ])}

      {props.editing &&
        <CreateCardLink
          pageId={id}
          key={`create-last`}
          createCard={createCard}
        />}
    </article>
  )
}

class CreateCardLink extends React.Component {
  props: {
    pageId: string,
    i?: number,
    createCard: typeof createCard,
  }

  handleCreateCard = () => {
    this.props.createCard(this.props.pageId, this.props.i)
  }

  render () {
    return <AddCardButton text="Add card" onClick={this.handleCreateCard} />
  }
}

export default connect(mapStateToProps, { updatePage, createCard })(Page)

const AddCardButton = styled(Button).attrs({
  className: 'pt-minimal',
  iconName: 'add',
})`
  margin-left: 1.5em;
  opacity: 0.5;
  transition: opacity ease-out 0.1s;

  &:hover {
    opacity: 1;
  }
`
