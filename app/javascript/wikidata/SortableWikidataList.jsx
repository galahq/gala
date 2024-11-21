/**
 * @providesModule SortableList
 * @flow
 */

import * as React from 'react'
import { Button, Intent, Icon, Spinner, InputGroup, Callout } from '@blueprintjs/core'
import {
  SortableContainer,
  SortableElement,
  SortableHandle,
  arrayMove,
} from 'react-sortable-hoc'
import { injectIntl } from 'react-intl'

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
}

const Handle = SortableHandle(() => (
  <span
    className="pt-button pt-icon-drag-handle-horizontal pt-fixed"
    style={{ marginRight: -3 }}
  />
))

const Item = SortableElement(
  ({ item, index, render: Render, onChangeItem, onRemove }: ItemProps<*>) => (
    <div className="pt-control-group pt-fill" style={{ marginBottom: '0.5em' }}>
      <Handle />

      <Render item={item} index={index} onChangeItem={onChangeItem} />

      <Button
        className="pt-fixed"
        intent={Intent.DANGER}
        icon="delete"
        onClick={onRemove}
      />
    </div>
  )
)

// $FlowFixMe
const Container = SortableContainer(
  ({ newItem, items, render, onChange }: ContainerProps<*>) => (
    <div>
      {items.map((item, i) => (
        <Item
          key={i}
          index={i}
          item={item}
          render={render}
          onChangeItem={item => onChange(update(i, item, items))}
          onRemove={() => onChange(remove(i, 1, items))}
        />
      ))}
      <Button
        intent={Intent.SUCCESS}
        icon="add"
        text="Add"
        onClick={_ => onChange(append(newItem, items))}
      />
    </div>
  )
)

const SortableWikidataList = (props: Props<*>) => {
  return (
    <Container
      {...props}
      useDragHandle={true}
      transitionDuration={100}
      helperClass={`sortable-helper${props.dark ? ' pt-dark' : ''}`}
      onSortEnd={({ oldIndex, newIndex }) =>
        props.onChange(arrayMove(props.items, oldIndex, newIndex))
      }
    />)
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
            setValue('')
            setResults(null)
            setError(null)
            setInputIntent(Intent.NONE)
          } else {
            setValue(item)
            setError(null)
            setInputIntent(Intent.NONE)
            setLoading(true)
            if (isValidQId(item)) {
              makeQuery(item)
            }
          }
        }
        setTyping(false)
      }, [item])

      const handleChange = (e) => {
        const newValue = e.target.value
        setTyping(true)
        setValue(newValue)
        onChangeItem(newValue)
      }

      const handleBlur = () => {
        setLoading(true)
        if (isValidQId(value)) {
          makeQuery(value)
        }
      }

      const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
          handleBlur()
        }
      }

      const isValidQId = (id) => {
        return id.startsWith("Q")
      }

      const makeQuery = (id) => {
        Orchard.harvest(`sparql/${schema}/${id.trim()}`)
          .then((resp) => {
            console.log(resp)
            if (Array.isArray(resp) && resp.length === 0) {
              setError("No results found")
              setInputIntent(Intent.DANGER)
            } else {
              setResults(resp)
              setLoading(false)
              setError(null)
              setInputIntent(Intent.SUCCESS)
            }
          })
          .catch((err) => {
            if (err.response && err.response.status === 404) {
              setError("Entity not found")
            } else {
              setError(err.message)
            }
            setResults(null)
            setLoading(false)
            setInputIntent(Intent.DANGER)
          })
      }

      if (value !== "" && results) {
        return (
          <WikiDataContainer>
            <div className="data-container">
                <div className="person-container">
                    {
                        loading ? (<div className="spinner-container"><Spinner intent={Intent.PRIMARY} small={true} /></div>) : (
                            <>
                                <div>
                                    <a target="_blank" style={{ fontSize: '16px', color: 'white', display: 'flex', flexDirection: 'row', alignItems: 'center' }} href={results.entity} className="pt-minimal pt-dark pt-align-left" rel="noreferrer">
                                    <span style={{ textDecoration: 'underline', display: 'inline-block', maxWidth: '510px' }} className="pt-text-overflow-ellipsis">
                                        {results.entityLabel}
                                    </span>
                                    <span className="pt-icon-standard pt-icon-caret-right pt-align-right"></span>
                                    </a>
                                </div>
                                {
                                    results.properties.map((prop) => {
                                        const [key, value] = Object.entries(prop)[0]
                                        return (
                                            <span style={{ fontSize: '12px', fontWeight: 500, color: '#DADBD9' }} key={key}>
                                                <span>{key}:</span> {value} &nbsp;&nbsp;&nbsp;
                                            </span>
                                        )
                                    })
                                }
                            </>
                        )
                    }
                </div>
                <div className="wikidata-logo-container">
                    <Icon color="black" icon="graph" iconSize={14} />
                    <span className="wikidata-text">Wikidata</span>
                </div>
            </div>
          </WikiDataContainer>
        )
      }

      return (
        error ? (
          <Callout intent={Intent.DANGER} icon={null}>
            <InputGroup
              type="text"
              placeholder={placeholderId && intl.formatMessage({ id: placeholderId })}
              {...props}
              value={value}
              rightElement={loading && value !== "" && <Spinner intent={Intent.PRIMARY} small={true} />}
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
            rightElement={loading && value !== "" && <Spinner intent={Intent.PRIMARY} small={true} />}
            style={{ borderColor: error ? 'red' : 'inherit' }}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
          />
        )
      )
    }

    return injectIntl(SortableInput)
  }

const WikiDataContainer = styled.div`
  display: flex;
  flex-direction: column;
  background: #415E77;
  padding: 4px 16px;
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
    color: rgb(0, 0, 0);
    font-size: 14px;
  }

  .wikidata-logo-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    position: absolute;
    top: 1%;
    right: 6%;
    gap: 4px;
    opacity: 0.5;
    height: fit-content
  }

  .person-container {
    margin-top: 16px;
    margin-bottom: 16px;
  }

  .spinner-container {
    display: flex;
    align-items: center;
  }
`
