/**
 * @providesModule AuthorsList
 * @flow
 */

import * as React from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'
import { injectIntl, FormattedMessage } from 'react-intl'

import { Button, Dialog, Intent } from '@blueprintjs/core'

import { displayToast } from 'redux/actions'
import { isCompact } from 'shared/functions'

import SortableList, { createSortableInput } from 'utility/SortableList'

import type { Toast } from '@blueprintjs/core'
import type { IntlShape } from 'react-intl'
import type { Author, Byline } from 'redux/state'

type Props = {
  editing: boolean,
  byline: Byline,
  displayToast: Toast => void,
  intl: IntlShape,
  onFinishEditing: (?AuthorsListFormState) => void,
}
export type AuthorsListFormState = Byline

class AuthorsListForm extends React.Component<Props, AuthorsListFormState> {
  constructor (props: Props) {
    super(props)

    this.state = { ...props.byline }
  }

  handleChangeAuthors = authors => {
    this.setState({ authors })
  }

  handleChangeTranslators = (translators: string[]) => {
    this.setState({ translators })
  }

  handleChangeAcknowledgements = (
    e: SyntheticInputEvent<HTMLTextAreaElement>
  ) => {
    this.setState({ acknowledgements: e.currentTarget.value })
  }

  handleCancel = () => {
    this.props.onFinishEditing(null)
  }

  handleDone = () => {
    if (formStateClean(this.state)) {
      this.props.onFinishEditing(this.state)
    } else {
      this.props.displayToast({
        message: this.props.intl.formatMessage({
          id: 'cases.edit.missedSomething',
        }),
        intent: Intent.WARNING,
      })
    }
  }

  render () {
    const { editing, intl } = this.props
    const { authors, translators, acknowledgements } = this.state
    return (
      <Dialog
        isOpen={editing}
        icon="edit"
        className="bp3-dark"
        title={intl.formatMessage({ id: 'cases.edit.editingAuthors' })}
        style={{ width: 700 }}
        onClose={this.handleCancel}
      >
        <div className="bp3-dialog-body">
          <SectionTitle>
            <FormattedMessage id="activerecord.attributes.case.authors" />
          </SectionTitle>
          <SortableList
            dark
            items={authors}
            newItem=""
            render={AuthorInput}
            onChange={this.handleChangeAuthors}
          />

          <SectionTitle>
            <FormattedMessage id="activerecord.attributes.case.translators.other" />
          </SectionTitle>
          <SortableList
            dark
            items={translators}
            newItem=""
            render={TranslatorInput}
            onChange={this.handleChangeTranslators}
          />
          <SectionTitle>
            <FormattedMessage id="activerecord.attributes.case.acknowledgements" />
          </SectionTitle>
          <textarea
            className="bp3-input bp3-fill"
            value={acknowledgements}
            onChange={this.handleChangeAcknowledgements}
          />
        </div>
        <div className="bp3-dialog-footer">
          <div className="bp3-dialog-footer-actions">
            <Button text="Cancel" onClick={this.handleCancel} />
            <Button
              intent={Intent.SUCCESS}
              text={intl.formatMessage({ id: 'helpers.save' })}
              onClick={this.handleDone}
            />
          </div>
        </div>
      </Dialog>
    )
  }
}

export default connect(
  undefined,
  { displayToast }
)(injectIntl(AuthorsListForm))

function formStateClean ({
  authors,
  translators,
}: AuthorsListFormState): boolean {
  return isCompact(authors.map(a => a.name || '')) && isCompact(translators)
}

type AuthorInputProps = {
  item: Author,
  intl: IntlShape,
  onChangeItem: Author => void,
}
const BaseAuthorInput = ({ intl, item, onChangeItem }: AuthorInputProps) => (
  <span style={{ display: 'flex' }}>
    <input
      className="bp3-input"
      type="text"
      placeholder={intl.formatMessage({ id: 'cases.edit.authorName' })}
      value={item.name}
      onChange={(e: SyntheticInputEvent<*>) => {
        onChangeItem({ ...item, name: e.target.value })
      }}
    />

    <input
      className="bp3-input"
      style={{ flexGrow: 1 }}
      type="text"
      placeholder={intl.formatMessage({ id: 'cases.edit.authorInstitution' })}
      value={item.institution}
      onChange={(e: SyntheticInputEvent<*>) => {
        onChangeItem({ ...item, institution: e.target.value })
      }}
    />
  </span>
)
const AuthorInput = injectIntl(BaseAuthorInput)

const TranslatorInput = createSortableInput({
  placeholderId: 'cases.edit.translatorName',
})

const SectionTitle = styled.h5`
  &:not(:first-child) {
    margin-top: 2em;
  }
`
