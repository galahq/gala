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
import type { Byline } from 'redux/state'

type Props = {
  editing: boolean,
  byline: Byline,
  displayToast: Toast => void,
  onFinishEditing: (?AuthorsListFormState) => void,
}
export type AuthorsListFormState = { authors: string[], translators: string[] }

class AuthorsListForm extends React.Component<Props, AuthorsListFormState> {
  constructor (props: Props) {
    super(props)

    const { authors, translators } = props.byline
    this.state = { authors, translators }
  }

  handleChangeAuthors = (authors: string[]) => {
    this.setState({ authors })
  }

  handleChangeTranslators = (translators: string[]) => {
    this.setState({ translators })
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
    const { authors, translators } = this.state
    return (
      <Dialog
        isOpen={editing}
        iconName="edit"
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
  return isCompact(authors) && isCompact(translators)
}

const AuthorInput = createSortableInput({ placeholder: 'Author name' })
const TranslatorInput = createSortableInput({ placeholder: 'Translator name' })

const SectionTitle = styled.h5`
  &:not(:first-child) {
    margin-top: 2em;
  }
`
