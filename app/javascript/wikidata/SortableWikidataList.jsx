/**
 * @providesModule SortableList
 * @flow
 */

import * as React from 'react'
import {
  Button,
  Intent,
  Icon,
  Spinner,
  InputGroup,
  Callout,
} from '@blueprintjs/core'
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
            schema={schema} // Pass schema prop here
            index={i}
            position={i}
            item={item}
            render={render}
            editing={editing}
            wikidataLinksPath={wikidataLinksPath}
            onChangeItem={item => {
              return onChange(update(i, item, items))
            }}
            onRemove={() => {
              if (item.qid !== '') {
                Orchard.prune(`${wikidataLinksPath}/${item.qid}`)
                  .then(resp => {
                    console.log(resp)
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
      }} // Pass schema prop to Container
    />
  )
}

export default SortableWikidataList

const queriedQids = new Set()

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
    const [value, setValue] = React.useState(item.qid)
    const [error, setError] = React.useState(null)
    const [typing, setTyping] = React.useState(false)
    const [loading, setLoading] = React.useState(false)

    React.useEffect(() => {
      if (!typing && item.qid && !item.data && !queriedQids.has(item.qid)) {
        queriedQids.add(item.qid)
        makeQuery(item.qid)
      }
      setTyping(false)
    }, [item.qid])

    const handleChange = e => {
      const newValue = e.target.value
      setTyping(true)
      setValue(newValue)
    }

    const handleBlur = () => {
      if (!isValidQId(value)) {
        setError('Invalid QID')
        return
      }
      setError(null)
      onChangeItem({ ...item, qid: value })
      Orchard.graft(wikidataLinksPath, { schema, qid: value, position })
        .then(resp => {
          console.log(resp)
        })
        .catch(e => console.log(e))
    }

    const handleKeyDown = e => {
      if (e.key === 'Enter') {
        handleBlur()
      }
    }

    const isValidQId = id => {
      return typeof id === 'string' && id.startsWith('Q')
    }

    const makeQuery = qid => {
      setLoading(true)
      Orchard.harvest(`sparql/${schema}/${qid.trim()}`)
        .then((resp: SparqlResult) => {
          item.data = resp
          setError(null)
          onChangeItem({ ...item, qid, data: resp })
        })
        .catch(err => {
          setError(err.message)
          delete item.data
        })
        .finally(() => {
          setLoading(false)
        })
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

    if (value !== '' && results) {
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
                        {results.entityLabel}&nbsp;
                      </span>
                      ›
                    </a>
                  </div>
                  {results.properties.map(prop => {
                    const [key, value] = Object.entries(prop)[0]
                    return (
                      <span className="wikidata-details-text" key={key}>
                        <span style={{ fontWeight: 700 }}>{key}:</span> {value}{' '}
                        &nbsp;&nbsp;&nbsp;
                      </span>
                    )
                  })}
                </>
              )}
            </div>
            <div
              className="wikidata-logo-container"
              style={{ right: editing ? '7%' : '2%' }}
            >
              <Icon
                color="rgba(235, 234, 228, 0.5)"
                icon="graph"
                iconSize={14}
              />
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
          value={value}
          rightElement={
            loading &&
            value !== '' && <Spinner intent={Intent.PRIMARY} small={true} />
          }
          style={{ borderColor: error ? 'red' : 'inherit' }}
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
        value={value}
        rightElement={
          loading &&
          value !== '' && <Spinner intent={Intent.PRIMARY} small={true} />
        }
        style={{ borderColor: error ? 'red' : 'inherit' }}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      />
    )
  }

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
  }

  .wikidata-link {
    text-decoration: underline;
    display: inline-block;
    max-width: 510px;
    font-weight: 700;
    font-size: 16px;
  }

  .wikidata-details-text {
    font-size: 14px;
    font-weight: 400;
    color: rgb(218, 219, 217, 0.7);
  }
`
