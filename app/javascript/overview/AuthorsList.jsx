/**
 * @providesModule AuthorsList
 * @flow
 */

import React from 'react'

import { acceptKeyboardClick } from 'shared/keyboard'
import AuthorsListForm from './AuthorsListForm'

import type { Byline } from 'redux/state'
import type { AuthorsListFormState } from './AuthorsListForm'

class AuthorsList extends React.Component {
  props: {
    canEdit: boolean,
    byline: Byline,
    onChange: Byline => any,
  }
  state = { editing: false }

  handleStartEditing = (e: SyntheticEvent) => {
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
    const { authorsString, translatorsString } = byline

    return (
      <div
        tabIndex="0"
        role="button"
        style={{ cursor: canEdit ? 'pointer' : 'auto' }}
        onKeyPress={acceptKeyboardClick(this.handleStartEditing)}
        onClick={this.handleStartEditing}
      >
        <p>
          {authorsString}
          <br />
          {translatorsString !== '' &&
            <em>
              {translatorsString}
            </em>}
        </p>
        {canEdit &&
          <AuthorsListForm
            byline={byline}
            editing={this.state.editing}
            onFinishEditing={this.handleFinishEditing}
          />}
      </div>
    )
  }
}

export default AuthorsList
