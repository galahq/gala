/**
 * @providesModule SortableLinkedResourceList
 *
 */

import * as React from 'react'
import { Button, Intent, Tooltip } from '@blueprintjs/core'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { injectIntl } from 'react-intl'
import { move } from 'ramda'
import styled, { css } from 'styled-components'

import { connectionLabel, hrefFor } from './connections'

const DragHandle = props => (
  <span
    className="bp6-button bp6-icon-drag-handle-horizontal bp6-fixed"
    style={{ marginRight: -3 }}
    {...props}
  />
)

const SortableLinkedResourceList = ({
  intl,
  droppableId,
  editing,
  items,
  onReorder,
  onEdit,
  onRemove,
}) => {
  const handleDragEnd = ({ source, destination }) => {
    if (!destination || destination.index === source.index) return
    onReorder(move(source.index, destination.index, items))
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId={droppableId} direction={editing ? 'vertical' : 'horizontal'}>
        {provided => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={editing ? {} : { display: 'inline-flex', flexWrap: 'wrap' }}
          >
            {items.map((item, i) => (
              <Draggable
                key={item.id}
                draggableId={`linked-resource-${item.id}`}
                index={i}
                isDragDisabled={!editing}
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={snapshot.isDragging ? 'sortable-helper bp6-dark' : undefined}
                    style={{ ...provided.draggableProps.style }}
                  >
                    {editing ? (
                      <div className="bp6-control-group bp6-fill" style={{ marginBottom: '0.5em' }}>
                        <DragHandle {...provided.dragHandleProps} />
                        <ResourceDetails editing item={item} intl={intl} />
                        <Button
                          className="bp6-fixed"
                          icon="edit"
                          title={intl.formatMessage({ id: 'catalog.linkedResources.edit' })}
                          onClick={() => onEdit(item)}
                        />
                        <Button
                          className="bp6-fixed"
                          intent={Intent.DANGER}
                          icon="delete"
                          onClick={() => onRemove(item)}
                        />
                      </div>
                    ) : (
                      <StyledTooltip
                        content={<ResourceDetails item={item} intl={intl} />}
                      >
                        <a
                          href={hrefFor(item.identifiers[0])}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <LinkedResourceTag>{item.name}</LinkedResourceTag>
                        </a>
                      </StyledTooltip>
                    )}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  )
}

export default injectIntl(SortableLinkedResourceList)

const ResourceDetails = ({ item, editing, intl }) => (
  <ResourceContainer editing={editing}>
    <div className="data-container">
      <div className="resource-container">
        <div>
          {editing ? (
            <a
              href={hrefFor(item.identifiers[0])}
              target="_blank"
              rel="noopener noreferrer"
              className="linked-resource-title bp6-minimal bp6-dark bp6-align-left"
            >
              <span className="bp6-text-overflow-ellipsis linked-resource-link">
                {item.name}
              </span>
            </a>
          ) : (
            <span className="linked-resource-title bp6-minimal bp6-dark bp6-align-left">
              <span className="bp6-text-overflow-ellipsis">{item.name}</span>
            </span>
          )}
        </div>
        <div className="linked-resource-details-section">
          {item.description && (
            <div>
              <span className="linked-resource-details-text linked-resource-description">
                {item.description}
              </span>
            </div>
          )}
          {item.identifiers.map((identifier, i) => (
            <div key={`${identifier.type}-${i}`}>
              <span className="linked-resource-details-text">
                <span style={{ fontWeight: 400 }}>
                  {intl.formatMessage({
                    id: `catalog.linkedResources.identifierTypes.${identifier.type}`,
                  })}
                  :
                </span>{' '}
                {editing ? (
                  <a href={hrefFor(identifier)} target="_blank" rel="noopener noreferrer">
                    {identifier.value}
                  </a>
                ) : (
                  identifier.value
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="linked-resource-connection">
        <span className="linked-resource-connection-text">
          {connectionLabel(item, intl)}
        </span>
      </div>
    </div>
  </ResourceContainer>
)

const editingStyles = css`
  background: #415e77;
  border: 1px solid rgb(0, 0, 0, 0.22);
  padding: 4px 20px;
  flex: 1 1 auto;
  min-width: 0;

  .linked-resource-title {
    color: #ebeae4;
    &:hover {
      color: #6acb72;
    }
  }

  .linked-resource-details-text {
    color: rgb(218, 219, 217, 0.7);
  }

  .linked-resource-connection-text {
    color: rgba(235, 234, 228, 0.5);
  }
`

const viewingStyles = css`
  color: #01182d;

  .linked-resource-title {
    color: #01182d;
    background-color: #6acb72;
    padding: 0px 4px;
    font-weight: 400;
  }

  .linked-resource-details-text {
    margin-left: 4px;
    color: #01182d;
  }

  .linked-resource-connection-text {
    color: #01182d;
  }
`

const ResourceContainer = styled.div`
  display: block;
  height: 100%;
  ${props => props.editing && editingStyles}
  ${props => !props.editing && viewingStyles}

  .data-container {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    gap: 16px;
  }

  .linked-resource-connection {
    margin-top: 16px;
    opacity: 0.5;
    flex-shrink: 0;
  }

  .linked-resource-connection-text {
    text-transform: uppercase;
    font-size: 12px;
  }

  .resource-container {
    margin-top: 16px;
    margin-bottom: 16px;
    min-width: 0;
  }

  .linked-resource-title {
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  .linked-resource-link {
    display: inline-block;
    max-width: 510px;
    font-weight: 700;
  }

  .linked-resource-details-text {
    font-size: 14px;
    font-weight: 500;
    display: inline-block;
    margin-right: 10px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }

  .linked-resource-description {
    white-space: normal;
  }

  .linked-resource-details-section {
    line-height: normal;
    margin-top: 8px;
    display: block;
  }
`

const LinkedResourceTag = styled.span.attrs({ className: 'bp6-tag' })`
  margin: 0 0.5em 0.5em 0;
  cursor: pointer;
  text-decoration: underline;
  text-decoration-style: dotted;

  a:focus-visible > & {
    box-shadow: 0 0 0 2px var(--bp-emphasis-focus-color);
  }

  &:hover {
    background-color: rgb(206, 210, 212);
  }
`

const StyledTooltip = styled(Tooltip)`
  border-bottom-color: hsl(209, 52%, 24%, 0.8);
  vertical-align: baseline;
`
