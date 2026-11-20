/**
 * @providesModule LinkedResources
 *
 */

import * as React from 'react'
import { FormattedMessage, injectIntl } from 'react-intl'
import {
  Alert,
  Button,
  Icon,
  Intent,
  Popover,
  Position,
} from '@blueprintjs/core'
import styled from 'styled-components'
import { CatalogSection, SectionTitle } from 'catalog/shared'
import { Orchard, ignoreClientError } from 'shared/orchard'
import { LabelForScreenReaders } from 'utility/A11y'

import LinkedResourceDialog from './LinkedResourceDialog'
import SortableLinkedResourceList from './SortableLinkedResourceList'
import { connectionLabel, groupKey, orderedConnections } from './connections'

const PopoverContent = styled.div`
  padding: 1em;
  max-width: 400px;
`

// Preset connections in their fixed order, then each “other” label in the
// order it first appears
function groupResources (linkedResources) {
  const groups = new Map()
  orderedConnections
    .filter(c => c !== 'other')
    .forEach(c => groups.set(c, []))
  linkedResources.forEach(resource => {
    const key = groupKey(resource)
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(resource)
  })
  return [...groups.entries()].filter(([, items]) => items.length > 0)
}

// A preset connection’s heading opens its definition when clicked. Authors
// name “other” connections themselves, so those headings have no definition.
const ConnectionHeading = ({ id, resource, intl }) => {
  const [isOpen, setOpen] = React.useState(false)
  const label = connectionLabel(resource, intl)

  // Escape closes the definition wherever focus is
  React.useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = e => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  if (resource.connection === 'other') {
    return (
      <h3 className="linked-resources-group-title" id={id}>
        {label}
      </h3>
    )
  }

  const definitionId = `${id}-definition`
  const popoverId = `${id}-definition-popover`
  const definition = intl.formatMessage({
    id: `catalog.linkedResources.connectionDefinitions.${resource.connection}`,
  })

  return (
    <>
      {/* The definition stays out of the heading so the heading, which also
          names its list, is just the category */}
      <h3 className="linked-resources-group-title" id={id}>
        <Popover
          content={<DefinitionContent id={popoverId}>{definition}</DefinitionContent>}
          isOpen={isOpen}
          onInteraction={setOpen}
          interactionKind="click"
          position={Position.TOP}
          className="bp6-dark"
          popoverClassName="linked-resources-definition bp6-dark"
          // A disclosure leaves focus on its button; see ResourceTag in
          // SortableLinkedResourceList for why both must be set explicitly
          autoFocus={false}
          enforceFocus={false}
          renderTarget={({ isOpen: _isOpen, ref, className, ...targetProps }) => (
            <button
              {...targetProps}
              ref={ref}
              type="button"
              className={`${className} linked-resources-definition-toggle`}
              // A disclosure, not a menu
              aria-haspopup={undefined}
              aria-expanded={isOpen}
              aria-controls={isOpen ? popoverId : undefined}
              aria-describedby={definitionId}
              // Blueprint re-fires its click handler on Enter/Space, and a real
              // button already does, so the popover would toggle twice
              onKeyDown={undefined}
            >
              {label}
              {/* A visible cue that the category has a definition. Decorative:
                  the button’s name stays just the category */}
              <Icon icon="info-sign" size={12} aria-hidden="true" />
            </button>
          )}
        />
      </h3>
      {/* Screen readers also get the definition from the page itself, so it
          reads in order and on focus without opening the popover */}
      <LabelForScreenReaders id={definitionId}>{definition}</LabelForScreenReaders>
    </>
  )
}

const DefinitionContent = styled.div`
  padding: 8px 12px;
  max-width: 280px;
`

const LinkedResources = ({
  editing,
  linkedResources = [],
  linkedResourcesPath,
  onChange,
  intl,
}) => {
  const [dialog, setDialog] = React.useState({ isOpen: false, resource: null })
  const [pendingDelete, setPendingDelete] = React.useState(null)
  const addButtonRef = React.useRef(null)

  const groups = React.useMemo(
    () => groupResources(linkedResources),
    [linkedResources]
  )

  if (!editing && linkedResources.length === 0) {
    return null
  }

  const handleSaved = saved => {
    const exists = linkedResources.some(r => r.id === saved.id)
    onChange(
      exists
        ? linkedResources.map(r => (r.id === saved.id ? saved : r))
        : [...linkedResources, saved]
    )
  }

  // Deleting removes the focused row, so send focus somewhere stable: the next
  // resource’s delete button, or the Add button when none is left
  const handleRemove = resource => {
    const index = linkedResources.findIndex(r => r.id === resource.id)
    const next = linkedResources[index + 1] || linkedResources[index - 1]
    Orchard.prune(`${linkedResourcesPath}/${resource.id}`).catch(ignoreClientError)
    onChange(linkedResources.filter(r => r.id !== resource.id))
    setPendingDelete(null)
    window.requestAnimationFrame(() => {
      const target =
        (next &&
          document.querySelector(`[data-linked-resource-delete="${next.id}"]`)) ||
        addButtonRef.current
      if (target) target.focus()
    })
  }

  // Positions are case-wide, so renumber everything in display order and save
  // only what moved
  const handleReorder = (key, reorderedGroup) => {
    const ordered = groups.flatMap(([k, items]) =>
      k === key ? reorderedGroup : items
    )
    const renumbered = ordered.map((resource, position) => {
      if (resource.position === position) return resource
      Orchard.espalier(`${linkedResourcesPath}/${resource.id}`, {
        linkedResource: { position },
      }).catch(ignoreClientError)
      return { ...resource, position }
    })
    onChange(renumbered)
  }

  return (
    <CatalogSection>
      <Container>
        <SectionTitle>
          <div className="linked-resources-title">
            <FormattedMessage id="catalog.linkedResources.title" />
            <Popover
              content={
                <PopoverContent>
                  <FormattedMessage id="catalog.linkedResources.about" />
                </PopoverContent>
              }
              position={Position.RIGHT}
              className="bp6-dark"
              popoverClassName="linked-resources-popover"
            >
              <button
                type="button"
                className="bp6-button bp6-minimal bp6-icon-info-sign"
                aria-label={intl.formatMessage({
                  id: 'catalog.linkedResources.aboutLabel',
                })}
              />
            </Popover>
          </div>
        </SectionTitle>

        {editing && (
          <div style={{ marginBottom: '12px' }}>
            <Button
              ref={addButtonRef}
              icon="add"
              intent={Intent.SUCCESS}
              onClick={() => setDialog({ isOpen: true, resource: null })}
            >
              <FormattedMessage id="catalog.linkedResources.add" />
            </Button>
          </div>
        )}

        <div className="linked-resources-container" style={{ gap: '4px' }}>
          {groups.map(([key, items]) => (
            <div key={key} className="bp6-dark">
              <ConnectionHeading
                id={`linked-resources-group-${key}`}
                resource={items[0]}
                intl={intl}
              />
              <SortableLinkedResourceList
                droppableId={`linked-resources-${key}`}
                labelledBy={`linked-resources-group-${key}`}
                editing={editing}
                items={items}
                onReorder={reordered => handleReorder(key, reordered)}
                onEdit={resource => setDialog({ isOpen: true, resource })}
                onRemove={setPendingDelete}
              />
            </div>
          ))}
        </div>

        {editing && (
          <LinkedResourceDialog
            isOpen={dialog.isOpen}
            resource={dialog.resource}
            position={linkedResources.length}
            linkedResourcesPath={linkedResourcesPath}
            onClose={() => setDialog(prev => ({ ...prev, isOpen: false }))}
            onSaved={handleSaved}
          />
        )}

        {editing && (
          <Alert
            canEscapeKeyCancel
            className="bp6-dark"
            isOpen={pendingDelete != null}
            icon="trash"
            intent={Intent.DANGER}
            cancelButtonText={intl.formatMessage({ id: 'helpers.cancel' })}
            confirmButtonText={intl.formatMessage({
              id: 'catalog.linkedResources.delete',
            })}
            onCancel={() => setPendingDelete(null)}
            onConfirm={() => handleRemove(pendingDelete)}
          >
            {pendingDelete && (
              <p>
                <FormattedMessage
                  id="catalog.linkedResources.deleteConfirmation"
                  values={{ name: pendingDelete.name }}
                />
              </p>
            )}
          </Alert>
        )}
      </Container>
    </CatalogSection>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;

  .linked-resources-title {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .linked-resources-container {
    display: flex;
    flex-direction: column;
  }

  .linked-resources-group-title {
    margin: 0;
    display: flex;
    align-items: center;
    gap: 6px;
    color: #ebeae3;
    font-size: 14px;
    font-weight: 400;
    margin-bottom: 2px;
  }

  .linked-resources-definition-toggle {
    padding: 0;
    border: 0;
    background: none;
    color: inherit;
    font: inherit;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 4px;

    .bp6-icon {
      opacity: 0.7;
    }

    &:hover .bp6-icon,
    &[aria-expanded='true'] .bp6-icon {
      opacity: 1;
    }
  }
`

export default injectIntl(LinkedResources)
