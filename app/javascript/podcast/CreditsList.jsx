/**
 * @providesModule CreditsList
 * 
 */

import * as React from 'react'

import { FormattedMessage } from 'react-intl'
import { FormattedList } from 'shared/react-intl'

import { acceptKeyboardClick } from 'shared/keyboard'
import CreditsListForm from './CreditsListForm'


class CreditsList extends React.Component {
  state = { editing: false }

  handleStartEditing = () => {
    if (this.props.canEdit) {
      this.setState({ editing: true })
      this.props.onStartEditing()
    }
  }

  handleFinishEditing = (formState) => {
    this.setState({ editing: false })
    if (formState != null) {
      this.props.onChange({
        ...formState,
        hosts_string: formState.hosts.join(' • '),
      })
    }
    this.props.onFinishEditing()
  }

  render () {
    const { canEdit, credits } = this.props
    let { guests, hosts } = credits

    return (
      <>
        <div
          tabIndex="0"
          role="button"
          style={{ cursor: canEdit ? 'pointer' : 'auto' }}
          onKeyPress={acceptKeyboardClick}
          onClick={this.handleStartEditing}
        >
          {guests.length > 0 || hosts.length > 0 ? (
            <>
              <dl>
                {guests.map(guest => {
                  return [
                    <dt key={`name:${guest.name}`}>{guest.name}</dt>,
                    <dd key={`title:${guest.title}`}>{guest.title}</dd>,
                  ]
                })}
              </dl>
              <em>
                <FormattedMessage
                  id="podcasts.show.withHost.js"
                  values={{ count: hosts.length }}
                />{' '}
                <FormattedList
                  list={hosts.map(h => (
                    <span key={h}>{h}</span>
                  ))}
                />
              </em>
            </>
          ) : (
            canEdit && (
              <button className="bp6-button bp6-icon-people">
                <FormattedMessage id="podcasts.edit.addGuests" />
              </button>
            )
          )}
        </div>
        <CreditsListForm
          credits={credits}
          editing={this.state.editing}
          onFinishEditing={this.handleFinishEditing}
        />
      </>
    )
  }
}

export default CreditsList
