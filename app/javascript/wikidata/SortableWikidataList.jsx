/**
 * @providesModule SortableList
 * @flow
 */

import * as React from 'react'
import { Button, Intent, InputGroup } from '@blueprintjs/core'
import { Callout } from '@blueprintjs/core/lib/esm/components/callout/callout'
import { Spinner } from '@blueprintjs/core/lib/esm/components/spinner/spinner'
import {
  SortableContainer,
  SortableElement,
  SortableHandle,
  arrayMove,
} from 'react-sortable-hoc'
import { injectIntl } from 'react-intl'
import type { WikidataLink, SparqlResult } from 'redux/state'

import { append, update, remove } from 'ramda'

import { Orchard } from 'shared/orchard'

import styled from 'styled-components'

import type { IntlShape } from 'react-intl'

type ItemProps<Item> = ChildProps<Item> & {
  render: React.ComponentType<Item>,
  onRemove: () => void,
}
type ContainerProps<Item> = {
  items: WikidataLink[],
  newItem: WikidataLink,
  render: React.ComponentType<Item>,
  onChange: (WikidataLink[]) => void,
  wikidataLinksPath: string,
  editing: boolean,
  schema: string, // Add schema to ContainerProps
}

// Use SortableList as a component with these props:
type Props<Item> = {
  // A function that renders one Item. It will be called with ChildProps.
  render: React.ComponentType<Item>,

  // An array of items that make up the SortableList. Each element will be
  // passed to children as item so that its contents may be rendered.
  items: WikidataLink[],

  // An example of a "blank" or "new" item to be added when the user presses the
  // "Add item" button
  newItem: WikidataLink,

  // Your chance to handle any change to the list. You will be called with a
  // changed copy of items.
  onChange: (WikidataLink[]) => void,

  // So the elements don’t change theme while being dragged
  dark?: boolean,

  wikidataLinksPath: string,

  editing: boolean,

  schema: string,
}

// The props with which the `render` props of SortableList will be called
type ChildProps<Item> = {
  // The item that this child should render
  item: WikidataLink,

  // The index of this child in the array (for numbering, etc.)
  index: number,

  // A function which takes a modified copy of the child to replace it.
  onChangeItem: WikidataLink => void,

  schema: string,

  wikidataLinksPath: string,

  editing: boolean,

  position: number,
}

const Handle = SortableHandle(() => (
  <span
    className="pt-button pt-icon-drag-handle-horizontal pt-fixed"
    style={{ marginRight: -3 }}
  />
))

const Item = SortableElement(
  ({
    item,
    index,
    render: Render,
    onChangeItem,
    onRemove,
    wikidataLinksPath,
    editing,
    position,
  }: ItemProps<*>) => (
    <div className="pt-control-group pt-fill" style={{ marginBottom: '0.5em' }}>
      {editing && <Handle />}

      <Render
        item={item}
        index={index}
        position={position}
        wikidataLinksPath={wikidataLinksPath}
        editing={editing}
        onChangeItem={onChangeItem}
      />

      {editing && (
        <Button
          className="pt-fixed"
          intent={Intent.DANGER}
          icon="delete"
          onClick={onRemove}
        />
      )}
    </div>
  )
)

// $FlowFixMe
const Container = SortableContainer(
  ({
    newItem,
    items,
    render,
    onChange,
    schema,
    editing,
    wikidataLinksPath,
    ...rest
  }: ContainerProps<*>) => {
    return (
      <div>
        {items.map((item, i) => (
          <Item
            key={i}
            schema={schema}
            index={i}
            position={i}
            item={item}
            render={render}
            editing={editing}
            wikidataLinksPath={wikidataLinksPath}
            onChangeItem={item => {
              console.log('item', item)
              return onChange(update(i, item, items))
            }}
            onRemove={() => {
              if (item.id) {
                Orchard.prune(`${wikidataLinksPath}/${item.id}`)
                  .then(resp => {
                    queryQueue.delete(item.qid.trim())
                  })
                  .catch(e => console.log(e))
              }
              return onChange(remove(i, 1, items))
            }}
          />
        ))}
        {editing && (
          <Button
            intent={Intent.SUCCESS}
            icon="add"
            text="Add"
            onClick={_ => {
              return onChange(append(newItem, items))
            }}
          />
        )}
      </div>
    )
  }
)

const SortableWikidataList = (props: Props<*>) => {
  return (
    <Container
      {...props}
      useDragHandle={true}
      transitionDuration={100}
      helperClass={`sortable-helper${props.dark ? ' pt-dark' : ''}`}
      schema={props.schema}
      onSortEnd={({ oldIndex, newIndex }) => {
        const orderedItems = arrayMove(props.items, oldIndex, newIndex)
        props.onChange(orderedItems)
        orderedItems.map((item, i) => {
          Orchard.graft(props.wikidataLinksPath, {
            qid: item.qid,
            schema: props.schema,
            position: i,
          })
            .then(resp => {
              console.log(resp)
            })
            .catch(e => console.log(e))
        })
      }}
    />
  )
}

export default SortableWikidataList

const queryQueue = new Map()
function enqueueQuery (schema: string, qid: string): Promise<SparqlResult> {
  qid = qid.trim()
  if (queryQueue.has(qid)) {
    const existingPromise = queryQueue.get(qid)
    if (existingPromise) {
      return existingPromise
    }
  }
  const newPromise = Orchard.harvest(`sparql/${schema}/${qid}`)
  queryQueue.set(qid, newPromise)
  return newPromise
}

export function createSortableInput ({
  placeholderId,
  ...props
}: { placeholderId?: string } = {}) {
  const SortableInput = ({
    intl,
    item,
    onChangeItem,
    schema,
    wikidataLinksPath,
    editing,
    position,
  }: ChildProps<WikidataLink> & { intl: IntlShape }) => {
    const [qid, setQid] = React.useState(item.qid)
    const [error, setError] = React.useState(null)
    const [loading, setLoading] = React.useState(false)

    React.useEffect(() => {
      if (item.qid && !item.data && isValidQId(item.qid)) {
        handleQuery(item.qid)
      }
    }, [item.qid])

    const handleQuery = async qid => {
      try {
        setLoading(true)

        const resp: SparqlResult = await enqueueQuery(schema, qid)
        item.data = resp
        setError(null)
        onChangeItem({ ...item, data: resp })

        return resp
      } catch (err) {
        if (err.status === 404) {
          setError(intl.formatMessage({ id: 'catalog.wikidata.404Error' }))
          return
        }
        setError(err.message)
        delete item.data

        return null
      } finally {
        setLoading(false)
      }
    }

    const handleChange = e => {
      const qid = e.target.value.toUpperCase()
      setQid(qid)
    }

    const handleBlur = async () => {
      if (qid === '') {
        setError(intl.formatMessage({ id: 'catalog.wikidata.emptyQid' }))
        return
      }
      if (!isValidQId(qid)) {
        setError(intl.formatMessage({ id: 'catalog.wikidata.invalidQid' }))
        return
      }
      if (queryQueue.has(qid)) {
        setError(intl.formatMessage({ id: 'catalog.wikidata.entryExists' }))
        return
      }

      const result = await handleQuery(qid)

      if (result) {
        onChangeItem({ ...item, qid })

        if (!item.id || item.position !== position) {
          await Orchard.graft(wikidataLinksPath, { schema, qid, position })
        }
      }
    }

    const handleKeyDown = e => {
      if (e.key === 'Enter') {
        handleBlur()
      }
    }

    const isValidQId = id => {
      const pattern = /^[A-Za-z][0-9]+$/
      return typeof id === 'string' && (id.startsWith('Q') || id.startsWith('q')) && id.length > 1 && pattern.test(id)
    }

    const results = item.data

    if (!editing && !loading && !results) {
      return null
    }

    if (!editing && loading) {
      return (
        <div>
          <Spinner intent={Intent.PRIMARY} small={true} />
        </div>
      )
    }

    if (qid !== '' && results) {
      return (
        <WikiDataContainer>
          <div className="data-container">
            <div className="person-container">
              {loading ? (
                <div className="spinner-container">
                  <Spinner intent={Intent.PRIMARY} small={true} />
                </div>
              ) : (
                <>
                  <div>
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href={results.entity}
                      className="wikidata-title pt-minimal pt-dark pt-align-left"
                    >
                      <span className="pt-text-overflow-ellipsis wikidata-link">
                        {results.entityLabel}
                      </span>
                      <span className="wikidata-separator">›</span>
                    </a>
                  </div>
                  <div className="wikidata-details-section">
                    {results.properties.map((prop, i) => {
                      const [key, value] = Object.entries(prop)[0]
                      return value && (
                        <span className="wikidata-details-text" key={`${key}-${i}`}>
                          <span style={{ fontWeight: 400 }}>{key}:</span> {value}
                        </span>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
            <div
              className="wikidata-logo-container"
              style={{ right: editing ? '7%' : '2%' }}
            >
                <div style={{ width: '18px' }}>
                    {<WikidataLogo />}
                </div>
              <span className="wikidata-text">Wikidata</span>
            </div>
          </div>
        </WikiDataContainer>
      )
    }

    return error ? (
      <Callout intent={Intent.DANGER} icon={null}>
        <InputGroup
          type="text"
          placeholder={
            placeholderId && intl.formatMessage({ id: placeholderId })
          }
          {...props}
          value={qid}
          rightElement={
            loading &&
            qid !== '' && <Spinner intent={Intent.PRIMARY} small={true} />
          }
          style={{
            borderColor: error ? 'red' : 'inherit',
            marginBottom: '4px',
          }}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
        <span>{error}</span>
      </Callout>
    ) : (
      <InputGroup
        type="text"
        placeholder={placeholderId && intl.formatMessage({ id: placeholderId })}
        {...props}
        value={qid}
        rightElement={
          loading &&
          qid !== '' && <Spinner intent={Intent.PRIMARY} small={true} />
        }
        style={{ borderColor: error ? 'red' : 'inherit' }}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      />
    )
  }

  const WikidataLogo = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 10">
      <rect y=".01" width="4.6" height="10" fill="rgba(235,234,228,0.5)" />
      <rect x="5.95" width="2.23" height="10" fill="rgba(235,234,228,0.5)" />
      <rect x="9.57" width="4.6" height="10" fill="rgba(235,234,228,0.5)" />
      <rect x="15.61" width="2.2" height="10" fill="rgba(235,234,228,0.5)" />
    </svg>
  )

  return injectIntl(SortableInput)
}

const WikiDataContainer = styled.div`
  display: flex;
  flex-direction: column;
  background: #415e77;
  padding: 4px 20px;
  border-width: 1px;
  border-style: solid;
  border-color: rgb(0, 0, 0, 0.22);
  height: 100%;

  .data-container {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }

  .wikidata-text {
    color: rgba(235, 234, 228, 0.5);
    text-transform: uppercase;
    font-size: 12px;
  }

  .wikidata-logo-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    position: absolute;
    top: 3%;
    gap: 4px;
    opacity: 0.5;
    height: fit-content;
  }

  .person-container {
    margin-top: 16px;
    margin-bottom: 16px;
  }

  .spinner-container {
    display: flex;
    align-items: center;
  }

  .wikidata-title {
    color: #ebeae4;
    display: flex;
    flex-direction: row;
    align-items: center;

    &:hover {
      color: #6ACB72;
    }
  }

  .wikidata-link {
    display: inline-block;
    max-width: 510px;
    font-weight: 700;
    font-size: 16px;
  }

  .wikidata-separator {
    margin-left: 2px;
  }

  .wikidata-details-text {
    font-size: 14px;
    font-weight: 500;
    color: rgb(218, 219, 217, 0.7);
    display: inline-block;
    margin-right: 10px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }

  .wikidata-details-section {
    line-height: normal;
    margin-top: 8px;
  }
`
