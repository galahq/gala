/**
 * @providesModule SortableLinkedResourceList
 *
 */

import * as React from 'react'
import { Button, Intent, Popover } from '@blueprintjs/core'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { injectIntl } from 'react-intl'
import { move } from 'ramda'
import styled from 'styled-components'

import { LabelForScreenReaders } from 'utility/A11y'
import { connectionLabel, hrefFor } from './connections'

const DragHandle = props => (
  <span
    className="bp6-button bp6-icon-drag-handle-horizontal bp6-fixed"
    style={{ marginRight: -3 }}
    {...props}
  />
)

const t = (intl, id, values) =>
  intl.formatMessage({ id: `catalog.linkedResources.${id}` }, values)

// A link to an identifier that says, for screen readers, that it opens a new tab
const ExternalLink = ({ href, intl, children, ...props }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
    {children}
    <LabelForScreenReaders as="span"> {t(intl, 'opensInNewTab')}</LabelForScreenReaders>
  </a>
)

const SortableLinkedResourceList = ({
  intl,
  droppableId,
  labelledBy,
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
          <List
            ref={provided.innerRef}
            {...provided.droppableProps}
            aria-labelledby={labelledBy}
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
                  <li
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={snapshot.isDragging ? 'sortable-helper bp6-dark' : undefined}
                    style={{ ...provided.draggableProps.style }}
                  >
                    {editing ? (
                      <div className="bp6-control-group bp6-fill" style={{ marginBottom: '0.5em' }}>
                        <DragHandle
                          {...provided.dragHandleProps}
                          aria-label={t(intl, 'reorderResource', { name: item.name })}
                        />
                        <ResourceDetails item={item} intl={intl} />
                        <Button
                          className="bp6-fixed"
                          icon="edit"
                          aria-label={t(intl, 'editResource', { name: item.name })}
                          title={t(intl, 'editResource', { name: item.name })}
                          onClick={() => onEdit(item)}
                        />
                        <Button
                          className="bp6-fixed"
                          intent={Intent.DANGER}
                          icon="delete"
                          aria-label={t(intl, 'deleteResource', { name: item.name })}
                          title={t(intl, 'deleteResource', { name: item.name })}
                          data-linked-resource-delete={item.id}
                          onClick={() => onRemove(item)}
                        />
                      </div>
                    ) : (
                      // Click/tap (or Enter/Space) opens the details, which hold
                      // the links; focus moves in and Esc returns it to the tag
                      <Popover
                        autoFocus
                        shouldReturnFocusOnClose
                        content={<ResourceTooltip item={item} intl={intl} />}
                        interactionKind="click"
                        popoverClassName="linked-resource-tooltip"
                        enforceFocus={false}
                        renderTarget={({ isOpen, ref, ...targetProps }) => (
                          <LinkedResourceTag
                            {...targetProps}
                            ref={ref}
                            aria-expanded={isOpen}
                            aria-haspopup="dialog"
                          >
                            {item.name}
                          </LinkedResourceTag>
                        )}
                      />
                    )}
                  </li>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </List>
        )}
      </Droppable>
    </DragDropContext>
  )
}

export default injectIntl(SortableLinkedResourceList)

const identifierTypeLabel = (identifier, intl) =>
  intl.formatMessage({
    id: `catalog.linkedResources.identifierTypes.${identifier.type}`,
  })

// The expanded view readers see on hover, styled after the spotlight tour
const ResourceTooltip = ({ item, intl }) => (
  <TooltipCard
    role="dialog"
    aria-label={t(intl, 'detailsFor', { name: item.name })}
    tabIndex={-1}
  >
    <div className="lr-tooltip-connection">{connectionLabel(item, intl)}</div>
    <div className="lr-tooltip-name">
      <span className="bp6-icon bp6-icon-one-to-one" aria-hidden="true" />
      {item.name}
    </div>
    {item.description && (
      <p className="lr-tooltip-description">{item.description}</p>
    )}
    <dl className="lr-tooltip-identifiers">
      {item.identifiers.map((identifier, i) => (
        <React.Fragment key={`${identifier.type}-${i}`}>
          <dt>{identifierTypeLabel(identifier, intl)}</dt>
          <dd>
            <ExternalLink href={hrefFor(identifier)} intl={intl}>
              {identifier.value}
              <span aria-hidden="true"> ›</span>
            </ExternalLink>
          </dd>
        </React.Fragment>
      ))}
    </dl>
  </TooltipCard>
)

const ResourceDetails = ({ item, intl }) => (
  <ResourceContainer>
    <div className="data-container">
      <div className="resource-container">
        <div>
          <ExternalLink
            href={hrefFor(item.identifiers[0])}
            intl={intl}
            className="linked-resource-title bp6-minimal bp6-dark bp6-align-left"
          >
            <span className="bp6-text-overflow-ellipsis linked-resource-link">
              {item.name}
            </span>
          </ExternalLink>
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
                  {identifierTypeLabel(identifier, intl)}:
                </span>{' '}
                <ExternalLink href={hrefFor(identifier)} intl={intl}>
                  {identifier.value}
                </ExternalLink>
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

const ResourceContainer = styled.div`
  display: block;
  height: 100%;
  background: #415e77;
  border: 1px solid rgb(0, 0, 0, 0.22);
  padding: 4px 20px;
  flex: 1 1 auto;
  min-width: 0;

  /* Links match the catalog home’s keyword links: off-white, underlined on hover */
  .linked-resource-title,
  .linked-resource-details-text a {
    color: #ebeae4;
    text-decoration: none;

    &:hover {
      color: #ebeae4;
      text-decoration: underline;
    }
  }

  /* The title’s ellipsis span is inline-block, which doesn’t inherit the
     parent’s underline, so underline it directly */
  .linked-resource-title:hover .linked-resource-link {
    text-decoration: underline;
  }

  .linked-resource-details-text {
    color: rgb(218, 219, 217, 0.7);
  }

  .linked-resource-connection-text {
    color: rgba(235, 234, 228, 0.5);
  }

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

// Styled after the spotlight tour: sans type, chevron-led text, roomy padding.
// The cream surface and green top bar are in blueprint-theme.scss because the
// tooltip renders in a portal.
const TooltipCard = styled.div`
  width: 320px;
  max-width: calc(100vw - 32px);
  padding: 14px 20px 16px;
  color: #01182d;
  font-family: ${p => p.theme.sansFont};
  font-size: 14px;
  line-height: 1.43;

  .lr-tooltip-connection {
    color: #357e3c;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.5px;
    margin-left: 24px;
    text-transform: uppercase;
  }

  .lr-tooltip-name {
    font-size: 14px;
    font-weight: 600;
    margin: 2px 0 0 24px;

    .bp6-icon {
      color: #357e3c;
      margin-left: -24px;
      margin-right: 8px;
    }
  }

  .lr-tooltip-description {
    margin: 6px 0 0 24px;
    font-style: italic;
  }

  .lr-tooltip-identifiers {
    border-top: 1px solid rgba(1, 24, 45, 0.15);
    display: grid;
    gap: 2px 10px;
    grid-template-columns: max-content minmax(0, 1fr);
    margin: 10px 0 0 24px;
    padding-top: 8px;
  }

  dt {
    align-self: baseline;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.5px;
    opacity: 0.6;
    text-transform: uppercase;
  }

  dd {
    margin: 0;
    overflow-wrap: anywhere;
  }

  a {
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`

const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`

const LinkedResourceTag = styled.button.attrs({
  className: 'bp6-tag',
  type: 'button',
})`
  border: 0;
  margin: 0 0.5em 0.5em 0;
  cursor: pointer;
  /* Only the family, not the font shorthand: that would also reset the
     font-size and line-height .bp6-tag sets, leaving these a different size
     from the keyword tags, which are anchors and inherit neither. */
  font-family: inherit;
  text-decoration: underline;
  text-decoration-style: dotted;

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px var(--bp-emphasis-focus-color);
  }

  &:hover {
    background-color: rgb(206, 210, 212);
  }
`
