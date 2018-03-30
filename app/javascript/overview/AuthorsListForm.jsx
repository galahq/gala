/**
 * @providesModule AuthorsList
 * @flow
 */

import * as React from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'

import { Button, Dialog, Intent } from '@blueprintjs/core'

import { displayToast } from 'redux/actions'
import { isCompact } from 'shared/functions'

import SortableList, { createSortableInput } from 'utility/SortableList'

import type { Toast } from '@blueprintjs/core'
import type { Author, Byline } from 'redux/state'

type Props = {
  editing: boolean,
  byline: Byline,
  displayToast: Toast => void,
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
        message: 'You missed something!',
        intent: Intent.WARNING,
      })
    }
  }

  render () {
    const { editing } = this.props
    const { authors, translators, acknowledgements } = this.state
    return (
      <Dialog
        isOpen={editing}
        icon="edit"
        className="pt-dark"
        title="Editing authors and translators"
        style={{ width: 700 }}
        onClose={this.handleCancel}
      >
        <div className="pt-dialog-body">
          <SectionTitle>Authors</SectionTitle>
          <SortableList
            dark
            items={authors}
            newItem=""
            render={AuthorInput}
            onChange={this.handleChangeAuthors}
          />

          <SectionTitle>Translators</SectionTitle>
          <SortableList
            dark
            items={translators}
            newItem=""
            render={TranslatorInput}
            onChange={this.handleChangeTranslators}
          />
          <SectionTitle>Acknowledgements</SectionTitle>
          <textarea
            className="pt-input pt-fill"
            value={acknowledgements || ''}
            onChange={this.handleChangeAcknowledgements}
          />
        </div>
        <div className="pt-dialog-footer">
          <div className="pt-dialog-footer-actions">
            <Button text="Cancel" onClick={this.handleCancel} />
            <Button
              intent={Intent.SUCCESS}
              text="Done"
              onClick={this.handleDone}
            />
          </div>
        </div>
      </Dialog>
    )
  }
}

export default connect(undefined, { displayToast })(AuthorsListForm)

function formStateClean ({
  authors,
  translators,
}: AuthorsListFormState): boolean {
  return isCompact(authors.map(a => a.name)) && isCompact(translators)
}

type AuthorInputProps = { item: Author, onChangeItem: Author => void }
const AuthorInput = ({ item, onChangeItem }: AuthorInputProps) => (
  <span style={{ display: 'flex' }}>
    <input
      className="pt-input"
      type="text"
      placeholder="Author name"
      value={item.name}
      onChange={(e: SyntheticInputEvent<*>) => {
        onChangeItem({ ...item, name: e.target.value })
      }}
    />

    <input
      className="pt-input"
      style={{ flexGrow: 1 }}
      type="text"
      placeholder="Author institution"
      value={item.institution}
      onChange={(e: SyntheticInputEvent<*>) => {
        onChangeItem({ ...item, institution: e.target.value })
      }}
    />
  </span>
)

const TranslatorInput = createSortableInput({ placeholder: 'Translator name' })

const SectionTitle = styled.h5`
  &:not(:first-child) {
    margin-top: 2em;
  }
`
