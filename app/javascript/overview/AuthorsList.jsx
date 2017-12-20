/**
 * @providesModule AuthorsList
 * @flow
 */

import * as React from 'react'

import { acceptKeyboardClick } from 'shared/keyboard'
import AuthorsListForm from './AuthorsListForm'
import Acknowledgements from './Acknowledgements'
import { FormattedList } from 'shared/react-intl'

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
    const { authors, translators, acknowledgements } = byline

    return (
      // eslint-disable-next-line
      <div
        tabIndex={canEdit ? '0' : null} // eslint-disable-line
        role={canEdit ? 'button' : null}
        style={{ cursor: canEdit ? 'pointer' : null }}
        onKeyPress={acceptKeyboardClick}
        onClick={this.handleStartEditing}
      >
        <p>
          <FormattedList
            list={authors.map(a => <span key={a.name}>{a.name}</span>)}
          />
          <Acknowledgements contents={acknowledgements} />
          <br />
          {translators.length !== 0 && (
            <em>
              <FormattedList
                list={translators.map(t => <span key={t}>{t}</span>)}
              />
            </em>
          )}
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
