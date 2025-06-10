/**
 * @providesModule SortableList
 * @flow
 */

import * as React from 'react'
import { Button, Intent, InputGroup, Tooltip } from '@blueprintjs/core'
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

import styled, { css } from 'styled-components'

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

  // So the elements don't change theme while being dragged
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
      <div style={editing ? {} : { display: 'inline-flex' }}>
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
function enqueueQuery(schema: string, qid: string): Promise<SparqlResult> {
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

export function createSortableInput({
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
    const mountedRef = React.useRef(true)

    React.useEffect(() => {
      return () => {
        mountedRef.current = false
      }
    }, [])

    React.useEffect(() => {
      if (item.qid && !item.data && isValidQId(item.qid)) {
        handleQuery(item.qid)
      }
    }, [item.qid])

    const handleQuery = async qid => {
      try {
        setLoading(true)

        const resp: SparqlResult = await enqueueQuery(schema, qid)
        if (!mountedRef.current) return
        
        item.data = resp
        setError(null)
        // onChangeItem({ ...item, data: resp })

        return resp
      } catch (err) {
        if (!mountedRef.current) return
        
        if (err.status === 404) {
          setError(intl.formatMessage({ id: 'catalog.wikidata.404Error' }))
          return
        }
        setError(err.message)
        delete item.data

        return null
      } finally {
        if (mountedRef.current) {
          setLoading(false)
        }
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

      if (result && (!item.id || item.position !== position)) {
        const apiResponse = await Orchard.graft(wikidataLinksPath, {
          schema,
          qid,
          position,
        })

        onChangeItem({ ...item, qid, id: apiResponse.id })
      }
    }

    const handleKeyDown = e => {
      if (e.key === 'Enter') {
        handleBlur()
      }
    }

    const isValidQId = id => {
      const pattern = /^[A-Za-z][0-9]+$/
      return (
        typeof id === 'string' &&
        (id.startsWith('Q') || id.startsWith('q')) &&
        id.length > 1 &&
        pattern.test(id)
      )
    }

    const results: SparqlResult = item.data

    const state = getRenderState({ editing, loading, results, qid })

    switch (state) {
      case RenderState.IDLE:
        return null
      case RenderState.LOADING:
      case RenderState.SHOW_STATE:
        return <ShowState loading={loading} results={results} editing={editing} />
      case RenderState.EDIT_STATE:
        return editing && (
          <EditState
            qid={qid}
            error={error}
            intl={intl}
            placeholderId={placeholderId}
            handleChange={handleChange}
            handleBlur={handleBlur}
            handleKeyDown={handleKeyDown}
            loading={loading}
            props={props}
          />
        )
    }
  }

  return injectIntl(SortableInput)
}

const RenderState = {
  IDLE: 'IDLE',
  LOADING: 'LOADING',
  SHOW_STATE: 'SHOW_STATE',
  EDIT_STATE: 'EDIT_STATE',
}

const getRenderState = ({ editing, loading, results, qid }) => {
  if (loading) {
    return RenderState.LOADING
  }
  if (!editing && !results) {
    return RenderState.IDLE
  }
  if (qid && results) {
    return RenderState.SHOW_STATE
  }
  if (editing) {
    return RenderState.EDIT_STATE
  }
  return RenderState.IDLE
}

const EditState = ({
  qid,
  error,
  intl,
  placeholderId,
  handleChange,
  handleBlur,
  handleKeyDown,
  loading,
  props,
}) => {
  return (
    <Callout intent={error ? Intent.DANGER : Intent.NONE} icon={null}>
      <InputGroup
        type="text"
        placeholder={placeholderId && intl.formatMessage({ id: placeholderId })}
        value={qid}
        style={{
          borderColor: error ? 'red' : 'inherit',
          marginBottom: error ? '3px' : '1px',
        }}
        rightElement={
          loading &&
          qid !== '' && <Spinner intent={Intent.PRIMARY} small={true} />
        }
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        {...props}
      />
      <span>{error}</span>
    </Callout>
  )
}

const ShowState = ({ loading, results, editing }) => {
  const WikidataLogo = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 10">
      <rect y=".01" width="4.6" height="10" fill="rgba(235,234,228,0.5)" />
      <rect x="5.95" width="2.23" height="10" fill="rgba(235,234,228,0.5)" />
      <rect x="9.57" width="4.6" height="10" fill="rgba(235,234,228,0.5)" />
      <rect x="15.61" width="2.2" height="10" fill="rgba(235,234,228,0.5)" />
    </svg>
  )

  if (loading) {
    return (
      <div>
        <WikidataTag isLoading={true}>
          <span>Loading...</span>
        </WikidataTag>
      </div>
    )
  }

  return editing ? (
    <WikiDataContainer editing={editing}>
      <div className="data-container">
        <div className="person-container">
          <div>
            <a
              href={results.entity}
              target="_blank"
              rel="noopener noreferrer"
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
              return (
                value && (
                  <div key={`${key}-${i}-${value}`}>
                    <span className="wikidata-details-text">
                      <span style={{ fontWeight: 400 }}>{key}:</span> {value}
                    </span>
                  </div>
                )
              )
            })}
          </div>
        </div>
        <div className="wikidata-logo-container" style={{ right: '7%' }}>
          <div style={{ width: '18px' }}>
            <WikidataLogo />
          </div>
          <span className="wikidata-text">Wikidata</span>
        </div>
      </div>
    </WikiDataContainer>
  ) : (
    <div>
      <StyledTooltip
        content={
          <WikiDataContainer editing={editing}>
            <div className="data-container">
              <div className="person-container">
                <div>
                  <span className="wikidata-title pt-minimal pt-dark pt-align-left">
                    <span className="pt-text-overflow-ellipsis">
                      {results.entityLabel}
                    </span>
                    <span className="wikidata-separator"></span>
                  </span>
                </div>
                <div className="wikidata-details-section">
                  {results.properties.map((prop, i) => {
                    const [key, value] = Object.entries(prop)[0]
                    return (
                      value && (
                        <div key={`${key}-${i}-${value}`}>
                          <span className="wikidata-details-text">
                            <span style={{ fontWeight: 400 }}>{key}:</span> {value}
                          </span>
                        </div>
                      )
                    )
                  })}
                </div>
              </div>
              <div className="wikidata-logo-container" style={{ right: '7%' }}>
                <div style={{ width: '18px' }}>
                  <WikidataLogo />
                </div>
                <span className="wikidata-link">Wikidata</span>
              </div>
            </div>
          </WikiDataContainer>
        }>
        <a href={results.entity} target="_blank" rel="noopener noreferrer">
          <WikidataTag isLoading={false}>
            {results.entityLabel}
          </WikidataTag>
        </a>
      </StyledTooltip>
    </div>
  )
}

const editingStyles = css`
  background: #415e77;
  border: 1px solid rgb(0, 0, 0, 0.22);
  padding: 4px 20px;
  
  .wikidata-title {
    color: #ebeae4;
    &:hover {
      color: #6acb72;
    }
  }

  .wikidata-details-text {
    color: rgb(218, 219, 217, 0.7);
  }

  .wikidata-text {
    color: rgba(235, 234, 228, 0.5);
  }

  svg rect {
    fill: rgba(235, 234, 228, 0.5);
  }
`

const viewingStyles = css`
  color: #01182d;

  .wikidata-title {
    color: #01182d;
    background-color: #6acb72;
    padding: 0px 4px;
    font-weight: 400;
  }

  .wikidata-details-text {
    margin-left: 4px;
    color: #01182d;
  }

  .wikidata-text {
    color: #01182d;
  }

  .wikidata-link {
    font-weight: 300;
    font-size: 11px;
  }

  svg rect {
    fill: #01182d;
  }
`

const WikiDataContainer = styled.div`
  display: block;
  flex-direction: column;
  
 
  height: 100%;
  ${props => props.editing && editingStyles}
  ${props => !props.editing && viewingStyles}
  

  .data-container {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }

  .wikidata-text {
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
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  .wikidata-link {
    display: inline-block;
    max-width: 510px;
    font-weight: 700;
  }

  .wikidata-separator {
    margin-left: 2px;
  }

  .wikidata-details-text {
    font-size: 14px;
    font-weight: 500;
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
    display: block;
  }
`

const WikidataTag = styled.span.attrs(({ isLoading }) => ({
  className: `pt-tag ${isLoading ? 'pt-skeleton' : ''}`,
  role: 'link',
  tabIndex: 0,
  'aria-label': isLoading ? 'Loading Wikidata item' : 'View Wikidata entry'
}))`
  margin: 0 0.5em 0.5em 0;
  cursor: pointer;
  text-decoration: underline;
  text-decoration-style: dotted;
  outline: none;
  
  &:focus {
    box-shadow: 0 0 0 2px rgba(45, 114, 210, 0.6);
  }

  &:hover {
    background-color:rgb(206, 210, 212);
  }

  &.pt-skeleton {
    min-width: 100px;
    height: 20px;
    display: inline-block;
  }

  a {
    color: inherit;
    text-decoration: none;
  }
`

const StyledTooltip = styled(Tooltip)`
  border-bottom-color: hsl(209, 52%, 24%, 0.8);
  vertical-align: baseline;
`
