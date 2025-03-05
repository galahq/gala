/**
 * @providesModule Page
 * @flow
 */

import * as React from 'react'
import styled from 'styled-components'
import { connect } from 'react-redux'
import { Button } from '@blueprintjs/core'
import { Draggable, Droppable } from 'react-beautiful-dnd'

import { updatePage, createCard } from 'redux/actions'
import DetailsForm from 'page/DetailsForm'

import Edgenotes from 'edgenotes'
import Card from 'card'

import type { State, Page as PageT } from 'redux/state'

type OwnProps = { id: string, deleteElement: () => void }
function mapStateToProps (state: State, { id }: OwnProps) {
  return {
    editing: state.edit.inProgress,
    page: state.pagesById[id],
  }
}

type Props = OwnProps & { page: PageT } & {
  editing: boolean,
  updatePage: typeof updatePage,
  createCard: typeof createCard,
}
const Page = (props: Props) => {
  let { page, editing, updatePage, deleteElement, createCard } = props
  let { id, title, cards } = page

  return (
    <Droppable droppableId={`pages/${id}`} type="Page">
      {({ placeholder, innerRef: droppableRef }) => (
        <div ref={droppableRef}>
          <article>
            <section className="bp3-dark section Page-meta">
              {editing ? (
                <DetailsForm
                  page={page}
                  onChange={data => updatePage(id, data)}
                  onDelete={deleteElement}
                />
              ) : (
                <h1>{title}</h1>
              )}
            </section>

            {cards.map((cardId, i) => (
              <Draggable key={cardId} draggableId={`cards/${cardId}`} index={i}>
                {({
                  innerRef: draggableRef,
                  draggableProps,
                  dragHandleProps,
                }) => (
                  <Section ref={draggableRef} {...draggableProps}>
                    <Card id={cardId} dragHandleProps={dragHandleProps} />
                    <Edgenotes cardId={cardId} />
                  </Section>
                )}
              </Draggable>
            ))}

            {props.editing && (
              <CreateCardLink
                pageId={id}
                key={`create-last`}
                createCard={createCard}
              />
            )}
          </article>
          {placeholder}
        </div>
      )}
    </Droppable>
  )
}

// $FlowFixMe
export default connect(
  mapStateToProps,
  { updatePage, createCard }
)(Page)

const Section = styled.section`
  display: grid;
  grid-column-gap: 1em;
  grid-template-columns: repeat(2, 23em) repeat(2, minmax(min-content, 1fr));
  grid-template-rows: repeat(100, auto) repeat(100, [highlighted] auto);
  margin: 1em 1em 0;
  transition: grid-template-columns 0.3s;

  @media screen and (max-width: 1600px) {
    .has-comments-open & {
      grid-template-columns: repeat(2, 18em) repeat(2, minmax(min-content, 1fr));
    }
  }

  @media screen and (max-width: 1440px) {
    grid-template-columns: repeat(2, 18em) repeat(2, minmax(min-content, 1fr));
  }

  @media screen and (max-width: 1300px) {
    grid-template-columns: repeat(2, minmax(min-content, 18em));
  }

  @media screen and (max-width: 1024px) {
    .has-comment-threads-open & {
      grid-template-columns: repeat(2, 13em) repeat(2, minmax(min-content, 1fr));
    }
  }

  @media screen and (max-width: 768px) {
    .has-comment-threads-open & {
      grid-template-columns: repeat(2, 8em) repeat(2, minmax(min-content, 1fr));
    }
  }
`

const AddCardButton = styled(Button).attrs({
  className: 'bp3-minimal',
  icon: 'add',
})`
  margin: 1em 1.5em 0;
  opacity: 0.5;
  transition: opacity ease-out 0.1s;

  &:hover {
    opacity: 1;
  }
`

class CreateCardLink extends React.Component<{
  pageId: string,
  createCard: typeof createCard,
}> {
  handleCreateCard = () => {
    this.props.createCard(this.props.pageId)
  }

  render () {
    return (
      <div className="bp3-dark">
        <AddCardButton text="Add card" onClick={this.handleCreateCard} />
      </div>
    )
  }
}
