/**
 * @providesModule LinkedResources
 *
 */

import * as React from 'react'
import { FormattedMessage, injectIntl } from 'react-intl'
import { Button, Intent, Popover, Position } from '@blueprintjs/core'
import styled from 'styled-components'
import { CatalogSection, SectionTitle } from 'catalog/shared'
import { Orchard, ignoreClientError } from 'shared/orchard'

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

const LinkedResources = ({
  editing,
  linkedResources = [],
  linkedResourcesPath,
  onChange,
  intl,
}) => {
  const [dialog, setDialog] = React.useState({ isOpen: false, resource: null })

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

  const handleRemove = resource => {
    Orchard.prune(`${linkedResourcesPath}/${resource.id}`).catch(ignoreClientError)
    onChange(linkedResources.filter(r => r.id !== resource.id))
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
          <div className="linked-resources-title bp6-dark">
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
              <button className="bp6-button bp6-minimal bp6-icon-help" aria-label="Help" />
            </Popover>
          </div>
        </SectionTitle>

        {editing && (
          <div style={{ marginBottom: '12px' }}>
            <Button
              icon="add"
              intent={Intent.SUCCESS}
              onClick={() => setDialog({ isOpen: true, resource: null })}
            >
              <FormattedMessage id="catalog.linkedResources.add" />
            </Button>
          </div>
        )}

        <div
          className="linked-resources-container"
          style={editing ? { gap: '24px' } : { gap: '4px' }}
        >
          {groups.map(([key, items]) => (
            <div key={key} className="bp6-dark">
              <div className="linked-resources-group-title">
                {connectionLabel(items[0], intl)}
              </div>
              <SortableLinkedResourceList
                droppableId={`linked-resources-${key}`}
                editing={editing}
                items={items}
                onReorder={reordered => handleReorder(key, reordered)}
                onEdit={resource => setDialog({ isOpen: true, resource })}
                onRemove={handleRemove}
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
    font-weight: 700;
  }

  .linked-resources-container {
    display: flex;
    flex-direction: column;
  }

  .linked-resources-group-title {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #ebeae3;
    font-size: 14px;
    font-weight: 400;
    margin-bottom: 2px;
  }
`

export default injectIntl(LinkedResources)
