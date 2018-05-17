/**
 * @providesModule CreditsList
 * @flow
 */

import * as React from 'react'

import { FormattedMessage } from 'react-intl'
import { FormattedList } from 'shared/react-intl'

import { acceptKeyboardClick } from 'shared/keyboard'
import CreditsListForm from './CreditsListForm'

import type { PodcastCreditList } from 'redux/state'
import type { CreditsListFormState } from './CreditsListForm'

class CreditsList extends React.Component<
  {
    canEdit: boolean,
    credits: PodcastCreditList,
    onChange: PodcastCreditList => any,
  },
  { editing: boolean }
> {
  state = { editing: false }

  handleStartEditing = () => {
    if (this.props.canEdit) this.setState({ editing: true })
  }

  handleFinishEditing = (formState: ?CreditsListFormState) => {
    this.setState({ editing: false })
    if (formState != null) {
      this.props.onChange({
        ...formState,
        hosts_string: formState.hosts.join(' • '),
      })
    }
  }

  render () {
    const { canEdit, credits } = this.props
    let { guests, hosts } = credits

    return (
      <div
        tabIndex="0"
        role="button"
        style={{ cursor: canEdit ? 'pointer' : 'auto' }}
        onKeyPress={acceptKeyboardClick}
        onClick={this.handleStartEditing}
      >
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
          <FormattedList list={hosts.map(h => <span key={h}>{h}</span>)} />
        </em>
        <CreditsListForm
          credits={credits}
          editing={this.state.editing}
          onFinishEditing={this.handleFinishEditing}
        />
      </div>
    )
  }
}

export default CreditsList
