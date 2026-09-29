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

// The chip readers see. Both modes render this same component, so edit mode
// can’t drift from the reader’s view. Click/tap (or Enter/Space) opens the
// details, which hold the links; focus moves in and Esc returns it to the tag.
const ResourceTag = ({ item, intl }) => (
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
)

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
  /* Only the family, not the font shorthand: that would also reset the
     font-size and line-height .bp6-tag sets, leaving these a different size
     from the keyword tags, which are anchors and inherit neither. */
  font-family: inherit;

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px var(--bp-emphasis-focus-color);
  }

  /* Same hover as the keyword chips: the text darkens, the fill stays put. The
     base fill and text colour already come from the shared dark bp6-tag rule in
     blueprint-theme.scss, so there is nothing to restate here. !important for
     the same reason KeywordTag needs it — that rule is (0,4,0) and would
     otherwise beat this (0,2,0) hover. */
  &:hover {
    color: black !important;
  }
`
