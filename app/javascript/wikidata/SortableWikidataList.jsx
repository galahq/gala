/**
 * @providesModule SortableList
 *
 */

import * as React from 'react'
import { Button, Intent, InputGroup, Tooltip } from '@blueprintjs/core'
import { Callout } from '@blueprintjs/core/lib/esm/components/callout/callout'
import { Spinner } from '@blueprintjs/core/lib/esm/components/spinner/spinner'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { injectIntl } from 'react-intl'

import { update, remove, move } from 'ramda'

import { Orchard } from 'shared/orchard'

import styled, { css } from 'styled-components'



// Use SortableList as a component with these props:

// The props with which the `render` props of SortableList will be called

const DragHandle = (props) => (
  <span
    className="bp6-button bp6-icon-drag-handle-horizontal bp6-fixed"
    style={{ marginRight: -3 }}
    {...props}
  />
)

const Item = ({
  item,
  index,
  render: Render,
  onChangeItem,
  onRemove,
  wikidataLinksPath,
  editing,
  position,
  dragHandleProps,
}) => (
  <div className="bp6-control-group bp6-fill" style={{ marginBottom: '0.5em' }}>
    {editing && <DragHandle {...dragHandleProps} />}

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
        className="bp6-fixed"
        intent={Intent.DANGER}
        icon="delete"
        onClick={onRemove}
      />
    )}
  </div>
)

const SortableWikidataList = (props) => {
  const {
    items,
    render,
    onChange,
    schema,
    editing,
    wikidataLinksPath,
    dark,
  } = props

  const handleDragEnd = ({ source, destination }) => {
    if (!destination || destination.index === source.index) return

    const orderedItems = move(source.index, destination.index, items)
    onChange(orderedItems)
    orderedItems.map((item, i) => {
      Orchard.graft(wikidataLinksPath, {
        qid: item.qid,
        schema,
        position: i,
      })
        .then(resp => {
          console.log(resp)
        })
        .catch(e => console.log(e))
    })
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="wikidata-list" direction={editing ? 'vertical' : 'horizontal'}>
        {provided => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={editing ? {} : { display: 'inline-flex' }}
          >
            {items.map((item, i) => (
              <Draggable
                key={i}
                draggableId={`wikidata-item-${i}`}
                index={i}
                isDragDisabled={!editing}
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={
                      snapshot.isDragging
                        ? `sortable-helper${dark ? ' bp6-dark' : ''}`
                        : undefined
                    }
                    style={{ ...provided.draggableProps.style }}
                  >
                    <Item
                      schema={schema}
                      index={i}
                      position={i}
                      item={item}
                      render={render}
                      editing={editing}
                      wikidataLinksPath={wikidataLinksPath}
                      dragHandleProps={provided.dragHandleProps}
                      onChangeItem={item => onChange(update(i, item, items))}
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
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  )
}

export default SortableWikidataList

const queryQueue = new Map()
function enqueueQuery(schema, qid) {
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
} = {}) {
  const SortableInput = ({
    intl,
    item,
    onChangeItem,
    schema,
    wikidataLinksPath,
    editing,
    position,
  }) => {
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

        const resp = await enqueueQuery(schema, qid)
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

    const results = item.data

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
              className="wikidata-title bp6-minimal bp6-dark bp6-align-left"
            >
              <span className="bp6-text-overflow-ellipsis wikidata-link">
                {results.entityLabel}
              </span>
              <span className="wikidata-separator"></span>
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
                  <span className="wikidata-title bp6-minimal bp6-dark bp6-align-left">
                    <span className="bp6-text-overflow-ellipsis">
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
  className: `bp6-tag ${isLoading ? 'bp6-skeleton' : ''}`,
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
    box-shadow: 0 0 0 2px var(--bp-emphasis-focus-color);
  }

  &:hover {
    background-color:rgb(206, 210, 212);
  }

  &.bp6-skeleton {
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
