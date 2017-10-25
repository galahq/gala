/**
 * @providesModule AuthorsList
 * @flow
 */

import * as React from 'react'
import styled from 'styled-components'

import { Dialog, Button } from '@blueprintjs/core'

import { acceptKeyboardClick } from 'shared/keyboard'
import AuthorsListForm from './AuthorsListForm'

import type { Byline } from 'redux/state'
import type { AuthorsListFormState } from './AuthorsListForm'

class AuthorsList extends React.Component<
  {
    canEdit: boolean,
    byline: Byline,
    onChange: Byline => any,
  },
  { editing: boolean }
> {
  state = { editing: false }

  handleStartEditing = (e: SyntheticEvent<*>) => {
    if (this.props.canEdit) this.setState({ editing: true })
  }

  handleFinishEditing = (formState: ?AuthorsListFormState) => {
    this.setState({ editing: false })
    if (formState != null) {
      this.props.onChange({
        ...formState,
        authorsString: formState.authors.join(' • '),
        translatorsString: `Translators: ${formState.translators.join(' • ')}`,
      })
    }
  }

  render () {
    const { canEdit, byline } = this.props
    const { authorsString, translatorsString, acknowledgements } = byline

    return (
      <div
        tabIndex={canEdit ? '0' : null}
        role={canEdit ? 'button' : null}
        style={{ cursor: canEdit ? 'pointer' : null }}
        onKeyPress={acceptKeyboardClick}
        onClick={this.handleStartEditing}
      >
        <p>
          {authorsString}
          <Acknowledgements contents={acknowledgements} />
          <br />
          {translatorsString !== '' && <em>{translatorsString}</em>}
        </p>
        {canEdit && (
          <AuthorsListForm
            byline={byline}
            editing={this.state.editing}
            onFinishEditing={this.handleFinishEditing}
          />
        )}
      </div>
    )
  }
}

export default AuthorsList

class Acknowledgements extends React.Component<{ contents: string }, *> {
  state = { isOpen: false }

  handleClick = () =>
    this.setState(({ isOpen }: $PropertyType<Acknowledgements, 'state'>) => ({
      isOpen: !isOpen,
    }))

  render () {
    if (!this.props.contents) return null
    return [
      <AcknowledgementsButton
        key="1"
        aria-label="Acknowledgements"
        title="Acknowledgements"
        onClick={this.handleClick}
      />,
      <Dialog
        key="2"
        title="Acknowledgements"
        className="pt-dark"
        {...this.state}
        onClose={this.handleClick}
      >
        <div className="pt-dialog-body">
          <AcknowledgementsContents>
            {this.props.contents}
          </AcknowledgementsContents>
        </div>
        <div className="pt-dialog-footer">
          <div className="pt-dialog-footer-actions">
            <Button onClick={this.handleClick}>Close</Button>
          </div>
        </div>
      </Dialog>,
    ]
  }
}

const AcknowledgementsButton = styled(Button).attrs({
  className: 'pt-minimal pt-small',
  iconName: 'more',
})`
  margin-left: 0.25em;
`

const AcknowledgementsContents = styled.p.attrs({
  className: 'pt-running-text',
})`
  white-space: pre-wrap;
  margin: 0;
`
