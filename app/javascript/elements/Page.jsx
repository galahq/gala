/**
 * @providesModule Page
 * @flow
 */

import * as React from 'react'
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
    <article>
      <section className="section Page-meta">
        <h1 className="pt-dark" key={`h2:${id}`}>
          <EditableText
            multiline
            placeholder="Page title"
            value={title}
            disabled={!editing}
            onChange={(value: string) => updatePage(id, { title: value })}
          />
        </h1>
        {editing && (
          <button
            type="button"
            className="c-delete-element pt-button pt-intent-danger pt-icon-trash"
            onClick={deleteElement}
          >
            Delete Page
          </button>
        )}
      </section>

      {cards.map((cardId, i) => (
        <>
          {props.editing && (
            <CreateCardLink pageId={id} i={i} createCard={createCard} />
          )}
          <Section>
            <Card id={cardId} />
            <Edgenotes cardId={cardId} />
          </Section>
        </>
      ))}

      {props.editing && (
        <CreateCardLink
          pageId={id}
          key={`create-last`}
          createCard={createCard}
        />
      )}
    </article>
  )
}

export default connect(mapStateToProps, { updatePage, createCard })(Page)

const Section = styled.section`
  display: grid;
  grid-column-gap: 1em;
  grid-template-columns: repeat(2, 23em) repeat(2, minmax(min-content, 1fr));
  grid-template-rows: repeat(100, auto) repeat(100, [highlighted] auto);
  margin: 1em;

  @media screen and (max-width: 1440px) {
    grid-template-columns: repeat(2, 18em) repeat(2, minmax(min-content, 1fr));
  }

  @media screen and (max-width: 1300px) {
    grid-template-columns: repeat(2, minmax(min-content, 18em));
  }
`

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

class CreateCardLink extends React.Component<{
  pageId: string,
  i?: number,
  createCard: typeof createCard,
}> {
  handleCreateCard = () => {
    this.props.createCard(this.props.pageId, this.props.i + 1)
  }

  render () {
    return (
      <div className="pt-dark">
        <AddCardButton text="Add card" onClick={this.handleCreateCard} />
      </div>
    )
  }
}
