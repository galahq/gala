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
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'
import { forEachObjIndexed } from 'ramda'

import { Button, Dialog, Intent } from '@blueprintjs/core'

import { getEdgenoteSlugs } from 'edgenotes'
import { createEdgenote } from 'redux/actions'

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
      intl,
      unattachedEdgenotes,
      onSelectEdgenote,
      onCancel,
    } = this.props

    if (unattachedEdgenotes.length === 0) return null

    return (
      <Dialog isOpen={true} title="Unused Edgenotes" onClose={onCancel}>
        <div className="pt-dialog-body">
          <table className="pt-table pt-condensed">
            <thead>
              <tr>
                <td />
                <td>Caption</td>
              </tr>
            </thead>
            <tbody>
              {unattachedEdgenotes.map(edgenote => (
                <tr key={edgenote.slug}>
                  <td>
                    <Button
                      className="pt-minimal"
                      iconName="add"
                      text="Add"
                      onClick={() => onSelectEdgenote(edgenote.slug)}
                    />
                  </td>
                  <td>{edgenote.caption || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pt-dialog-footer">
          <div className="pt-dialog-footer-actions">
            <Button
              text={intl.formatMessage({
                id: 'cancel',
                defaultMessage: 'Cancel',
              })}
              onClick={onCancel}
            />
            <Button
              iconName="add"
              intent={Intent.PRIMARY}
              text={intl.formatMessage({
                id: 'edgenotes.new',
                defaultMessage: 'New Edgenote',
              })}
              onClick={() => createEdgenote().then(onSelectEdgenote)}
            />
          </div>
        </div>
      </Dialog>
    )
  }
}
export default connect(mapStateToProps, { createEdgenote })(
  injectIntl(EdgenoteLibrary)
)
