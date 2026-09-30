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
  <span className="bp6-button bp6-icon-drag-handle-horizontal bp6-fixed" {...props} />
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
                      // Editors get the reader's chip plus controls, so the list
                      // doubles as a preview of what the case will look like
                      <EditRow>
                        <DragHandle
                          {...provided.dragHandleProps}
                          aria-label={t(intl, 'reorderResource', { name: item.name })}
                        />
                        <ResourceTag item={item} intl={intl} />
                        <Button
                          icon="edit"
                          aria-label={t(intl, 'editResource', { name: item.name })}
                          title={t(intl, 'editResource', { name: item.name })}
                          onClick={() => onEdit(item)}
                        />
                        <Button
                          intent={Intent.DANGER}
                          icon="delete"
                          aria-label={t(intl, 'deleteResource', { name: item.name })}
                          title={t(intl, 'deleteResource', { name: item.name })}
                          data-linked-resource-delete={item.id}
                          onClick={() => onRemove(item)}
                        />
                      </EditRow>
                    ) : (
                      <ResourceTag item={item} intl={intl} />
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

// The details the chip reveals, styled after the spotlight tour. No role or
// label of its own: it’s the disclosed region, named by the chip that controls it.
const ResourceTooltip = ({ id, item, intl }) => (
  <TooltipCard id={id}>
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

// The chip readers see. Both modes render this same component, so edit mode
// can’t drift from the reader’s view.
//
// It expands to reveal its details and focus is left alone, so Tab simply 
// walks from the chip into the links. That only works while the card sits 
// right after the chip in DOM order, hence usePortal={false}. 
const ResourceTag = ({ item, intl }) => {
  const detailsId = `linked-resource-details-${item.id}`

  return (
    <Popover
      usePortal={false}
      positioningStrategy="fixed"
      content={<ResourceTooltip id={detailsId} item={item} intl={intl} />}
      interactionKind="click"
      popoverClassName="linked-resource-tooltip"
      // Both explicitly off: a disclosure leaves focus on the trigger. Dropping
      // them isn’t enough — for click interactions Popover forwards autoFocus as
      // undefined, so Overlay’s own `autoFocus: true` default would apply, and
      // Overlay renders its focus traps whenever autoFocus || enforceFocus.
      autoFocus={false}
      enforceFocus={false}
      renderTarget={({ isOpen, ref, ...targetProps }) => (
        <LinkedResourceTag
          {...targetProps}
          ref={ref}
          // Blueprint emits `popupKind ?? "menu"` for any non-hover interaction,
          // and the enum has no "none" — but a disclosure takes no aria-haspopup
          // at all, so strip what the spread brought in.
          aria-haspopup={undefined}
          aria-controls={detailsId}
          aria-expanded={isOpen}
          // Blueprint's onKeyDown re-fires its click handler on Enter/Space for
          // targets that aren't natively clickable. This one is a real <button>,
          // so the browser already synthesises that click and the popover would
          // toggle twice — open, then straight back closed. Blueprint guards
          // against this via isSimulatedButtonClick, but that only matches
          // targets carrying .bp6-button and this chip is a .bp6-tag.
          onKeyDown={undefined}
        >
          {item.name}
        </LinkedResourceTag>
      )}
    />
  )
}

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

const EditRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 4px;

  /* The chip carries bottom margin for wrapping in view mode; in this row the
     gap handles spacing and the margin would push it off centre. */
  .bp6-tag {
    margin: 0;
  }
`

const LinkedResourceTag = styled.button.attrs({
  className: 'bp6-tag',
  type: 'button',
})`
  border: 0;
  margin: 0 0.5em 0.5em 0;
  cursor: pointer;
  font-family: inherit;

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px var(--bp-emphasis-focus-color);
  }

  &:hover {
    color: black !important;
  }
`
