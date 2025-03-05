/**
 * This shows a list of the unattached Edgenotes from which the editor can
 * choose and a button that allows the creation of a new Edgenote. If there are
 * no unattached Edgenotes on the given case, this component immediately
 * posts the request to create a new Edgenote; the dialog never truly opens.
 *
 * @providesModule EdgenoteLibrary
 * @flow
 */

import * as React from 'react'
import styled from 'styled-components'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage } from 'react-intl'
import { forEachObjIndexed } from 'ramda'

import { Button, Dialog, Icon, Intent } from '@blueprintjs/core'

import { getEdgenoteSlugs } from 'edgenotes'
import { createEdgenote, deleteEdgenote } from 'redux/actions'

import type { IntlShape } from 'react-intl'
import type { State, CardsState, EdgenotesState, Edgenote } from 'redux/state'

function findUnattachedEdgenotes (
  cardsById: CardsState,
  edgenotesBySlug: EdgenotesState
) {
  const slugs = new Set(Object.keys(edgenotesBySlug))
  forEachObjIndexed(card => {
    card.editorState &&
      getEdgenoteSlugs(card.editorState).forEach(slug => slugs.delete(slug))
  }, cardsById)
  return [...slugs].map(slug => edgenotesBySlug[slug])
}

function mapStateToProps ({ cardsById, edgenotesBySlug }: State) {
  const unattachedEdgenotes = findUnattachedEdgenotes(
    cardsById,
    edgenotesBySlug
  )

  return { unattachedEdgenotes }
}

type Props = {
  createEdgenote: () => Promise<string>,
  deleteEdgenote: string => mixed,
  intl: IntlShape,
  unattachedEdgenotes: Edgenote[],
  onSelectEdgenote: string => void,
  onCancel: () => void,
}

class EdgenoteLibrary extends React.Component<Props> {
  componentDidMount () {
    const { unattachedEdgenotes, onSelectEdgenote, createEdgenote } = this.props
    if (unattachedEdgenotes.length === 0) {
      createEdgenote().then(onSelectEdgenote)
    }
  }

  render () {
    const {
      createEdgenote,
      deleteEdgenote,
      intl,
      unattachedEdgenotes,
      onSelectEdgenote,
      onCancel,
    } = this.props

    if (unattachedEdgenotes.length === 0) return null

    return (
      <Dialog
        icon="add-column-right"
        isOpen={true}
        title="Unused Edgenotes"
        style={{ width: 800 }}
        onClose={onCancel}
      >
        <div className="bp3-dialog-body">
          <div className="bp3-callout bp3-intent-success bp3-icon-help">
            <FormattedMessage id="edgenotes.index.reattachInstructions" />
          </div>

          <Table>
            <tbody>
              {unattachedEdgenotes.map(edgenote => (
                <UnattachedEdgenote
                  key={edgenote.slug}
                  edgenote={edgenote}
                  intl={intl}
                  onSelect={() => onSelectEdgenote(edgenote.slug)}
                  onDelete={() => deleteEdgenote(edgenote.slug)}
                />
              ))}
            </tbody>
          </Table>
        </div>

        <div className="bp3-dialog-footer">
          <div className="bp3-dialog-footer-actions">
            <Button
              text={intl.formatMessage({
                id: 'helpers.cancel',
              })}
              onClick={onCancel}
            />
            <Button
              icon="add"
              intent={Intent.SUCCESS}
              text={intl.formatMessage({ id: 'edgenotes.new.newEdgenote' })}
              onClick={() => createEdgenote().then(onSelectEdgenote)}
            />
          </div>
        </div>
      </Dialog>
    )
  }
}
// $FlowFixMe
export default connect(
  mapStateToProps,
  { createEdgenote, deleteEdgenote }
)(injectIntl(EdgenoteLibrary))

const Table = styled.table.attrs({ className: 'bp3-html-table bp3-small' })`
  width: 100%;
  margin-top: 1em;
`

const Td = styled.td`
  padding-top: 9px !important;
  min-width: 140px;

  & .bp3-icon-standard {
    color: #bdbaab;
    margin-right: 6px;
  }
`

/**
 * Shows only the Edgenote attributes that would be visible based on that
 * Edgenote’s style.
 */
const UnattachedEdgenote = ({ edgenote, intl, onSelect, onDelete }) => {
  let attributeComponents = []
  if (edgenote.pullQuote || edgenote.audioUrl) {
    attributeComponents = [PullQuote, HasAudio, Website]
  } else if (edgenote.imageUrl) {
    attributeComponents = [Image, AltText, Website]
  } else {
    attributeComponents = [Website, Blank, Blank]
  }

  return (
    <tr>
      <td>
        <Button
          aria-label={intl.formatMessage({ id: 'edgenotes.index.attach' })}
          className="bp3-minimal bp3-small"
          icon="add"
          intent={Intent.SUCCESS}
          onClick={onSelect}
        />
      </td>

      <Td>
        <Icon
          aria-label={intl.formatMessage({ id: 'edgenotes.edgenote.caption' })}
          icon="tag"
        />{' '}
        {edgenote.caption || '—'}
      </Td>

      {attributeComponents.map((Component, i) => (
        <Component key={i} edgenote={edgenote} intl={intl} />
      ))}

      <td>
        <Button
          aria-label={intl.formatMessage({ id: 'edgenotes.destroy.delete' })}
          className="bp3-minimal bp3-small"
          icon="trash"
          intent={Intent.DANGER}
          onClick={onDelete}
        />
      </td>
    </tr>
  )
}

const Link = styled.a.attrs({ target: '_blank', rel: 'noopener noreferrer' })``

const Blank = () => <Td>—</Td>

const PullQuote = ({ edgenote, intl }) => (
  <Td>
    <Icon
      aria-label={intl.formatMessage({ id: 'edgenotes.pullQuote' })}
      icon="citation"
    />
    {edgenote.pullQuote}
  </Td>
)

const HasAudio = ({ edgenote, intl }) => (
  <Td>
    {edgenote.audioUrl ? (
      <Icon
        aria-label={intl.formatMessage({ id: 'edgenotes.hasAudio' })}
        icon="volume-up"
      />
    ) : null}
  </Td>
)

const Img = styled.img`
  width: 46px;
  height: 46px;
  object-fit: cover;
`

const Image = ({ edgenote }) => (
  <Td>
    <Img src={edgenote.imageUrl} role="presentation" />
  </Td>
)

const AltText = ({ edgenote }) => <Td>{edgenote.altText || '—'}</Td>

const BreakingLink = styled(Link)`
  word-break: break-all;
`
const Website = ({ edgenote }) => (
  <Td>
    {edgenote.websiteUrl ? (
      <>
        <Icon icon="link" />
        <BreakingLink href={edgenote.websiteUrl}>
          {edgenote.callToAction || edgenote.websiteUrl}
        </BreakingLink>
      </>
    ) : (
      '—'
    )}
  </Td>
)
