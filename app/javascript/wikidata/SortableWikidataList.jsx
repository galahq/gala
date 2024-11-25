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
import type { WikidataLink, Case } from 'redux/state'

import { append, update, remove } from 'ramda'

import { Orchard } from 'shared/orchard'

import styled from 'styled-components'

import type { IntlShape } from 'react-intl'

type ItemProps<Item> = ChildProps<Item> & {
  render: React.ComponentType<Item>,
  onRemove: () => void,
}
type ContainerProps<Item> = {
  items: Item[],
  newItem: Item,
  render: React.ComponentType<Item>,
  onChange: (Item[]) => void,
  caseData: Case,
  editing: boolean,
  schema: string, // Add schema to ContainerProps
}

// Use SortableList as a component with these props:
type Props<Item> = {
  // A function that renders one Item. It will be called with ChildProps.
  render: React.ComponentType<Item>,

  // An array of items that make up the SortableList. Each element will be
  // passed to children as item so that its contents may be rendered.
  items: Item[],

  // An example of a "blank" or "new" item to be added when the user presses the
  // "Add item" button
  newItem: Item,

  // Your chance to handle any change to the list. You will be called with a
  // changed copy of items.
  onChange: (Item[]) => void,

  // So the elements don’t change theme while being dragged
  dark?: boolean,

  caseData: Case,

  editing: boolean,

  schema: string,
}

// The props with which the `render` props of SortableList will be called
type ChildProps<Item> = {
  // The item that this child should render
  item: Item,

  // The index of this child in the array (for numbering, etc.)
  index: number,

  // A function which takes a modified copy of the child to replace it.
  onChangeItem: Item => void,

  schema: string,

  caseData: Case,

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
  ({ item, index, render: Render, onChangeItem, onRemove, caseData, editing, position }: ItemProps<*>) => (
    <div className="pt-control-group pt-fill" style={{ marginBottom: '0.5em' }}>
      {
        editing && <Handle />
      }

      <Render item={item} index={index} position={position} caseData={caseData} editing={editing} onChangeItem={onChangeItem} />

      {
        editing && <Button
        className="pt-fixed"
        intent={Intent.DANGER}
        icon="delete"
        onClick={onRemove}
        />
      }
    </div>
  )
)

// $FlowFixMe
const Container = SortableContainer(
  ({ newItem, items, render, onChange, caseData, schema, editing, ...rest }: ContainerProps<*>) => {
    console.log("Container Props:", { newItem, items, render, onChange, schema })
    console.log("rest props", rest)
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
            caseData={caseData}
            onChangeItem={item => {
              console.log(`Item changed at index ${i}`, item)
              return onChange(update(i, item, items))
            }}
            onRemove={() => {
              console.log(`Item removed at index ${i}`, items[i])
              console.log("item", item)
              if (item !== '') {
                Orchard.prune(`/cases/${caseData.slug}/wikidata_links/${item}`).then(resp => {
                  console.log(resp)
                })
                .catch(e => console.log(e))
              }
              return onChange(remove(i, 1, items))
            }}
          />
        ))}
        {
          editing && <Button
              intent={Intent.SUCCESS}
              icon="add"
              text="Add"
              onClick={_ => {
                return onChange(append(newItem, items))
              }}
          />
        }
      </div>
    )
  }
)

const SortableWikidataList = (props: Props<*>) => {
  console.log('SortableWikidataList props', props)
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
          Orchard.graft(`/cases/${props.caseData.slug}/wikidata_links`, { qid: item, schema: props.schema, position: i })
            .then(resp => {
              console.log(resp)
            })
            .catch(e => console.log(e))
        })
        }
      } // Pass schema prop to Container
    />
  )
}

export default SortableWikidataList

export function createSortableInput ({
  placeholderId,
  ...props
}: { placeholderId?: string } = {}) {
  const SortableInput = ({
    intl,
    item,
    onChangeItem,
    schema,
    caseData,
    editing,
    position,
  }: ChildProps<string> & { intl: IntlShape }) => {
    const [value, setValue] = React.useState(item)
    const [results, setResults] = React.useState(null)
    const [error, setError] = React.useState(null)
    const [inputIntent, setInputIntent] = React.useState(Intent.NONE)
    const [typing, setTyping] = React.useState(false)
    const [loading, setLoading] = React.useState(false)

    React.useEffect(() => {
      if (!typing) {
        if (!item) {
          setValue("")
          setResults(null)
          setError(null)
          setInputIntent(Intent.NONE)
        } else {
          setError(null)
          setInputIntent(Intent.NONE)
          if (isValidQId(item) && results === null) {
            setLoading(true)
            setValue(item)
            makeQuery(item)
          }
        }
      }
      setTyping(false)
    }, [item])

    const handleChange = e => {
      const newValue = e.target.value
      setTyping(true)
      setValue(newValue)
    }

    const handleBlur = () => {
      setLoading(true)
      if (isValidQId(value)) {
        makeQuery(value)
        onChangeItem(value)
        addWikidataLinks(value)
      }
    }

    const handleKeyDown = e => {
      if (e.key === 'Enter') {
        handleBlur()
      }
    }

    const isValidQId = (id) => {
      return typeof id === 'string' && id.startsWith("Q")
    }

    const makeQuery = qid => {
      Orchard.harvest(`sparql/${schema}/${qid.trim()}`)
        .then(resp => {
          if (resp == null) {
            setError('No results found')
            setInputIntent(Intent.DANGER)
          } else {
            setResults(resp)
            setLoading(false)
            setError(null)
            setInputIntent(Intent.SUCCESS)
          }
        })
        .catch(err => {
          if (err.response && err.response.status === 404) {
            setError('Entity not found')
          } else {
            setError(err.message)
          }
          setResults(null)
          setLoading(false)
          setInputIntent(Intent.DANGER)
        })
    }

    const addWikidataLinks = qid => {
      Orchard.graft(`/cases/${caseData.slug}/wikidata_links`, { schema, qid, position })
        .then(resp => {
          console.log(resp)
        })
        .catch(e => console.log(e))
    }

    if (!editing && loading) {
      return (<div>
          <Spinner intent={Intent.PRIMARY} small={true} />
        </div>)
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
            <div className="wikidata-logo-container" style={{ right: editing ? '7%' : '2%' }}>
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
