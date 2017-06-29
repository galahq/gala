/**
 * @providesModule CreditsList
 * @flow
 */

import React from 'react'

import { FormattedMessage } from 'react-intl'

import { acceptKeyboardClick } from 'shared/keyboard'
import CreditsListForm from './CreditsListForm'

import type { PodcastCreditList } from 'redux/state'
import type { CreditsListFormState } from './CreditsListForm'

class CreditsList extends React.Component {
  props: {
    canEdit: boolean,
    credits: PodcastCreditList,
    onChange: PodcastCreditList => any,
  }
  state = { editing: false }

  handleStartEditing = (e: SyntheticEvent) => {
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
    let { guests, hosts, hosts_string: hostsString } = credits

    return (
      <div
        tabIndex="0"
        role="button"
        style={{ cursor: canEdit ? 'pointer' : 'auto' }}
        onKeyPress={acceptKeyboardClick(this.handleStartEditing)}
        onClick={this.handleStartEditing}
      >
        <dl>
          {guests.map(guest => {
            return [
              <dt key={`name:${guest.name}`}>
                {guest.name}
              </dt>,
              <dd key={`title:${guest.title}`}>
                {guest.title}
              </dd>,
            ]
          })}
        </dl>
        <em>
          <FormattedMessage
            id="podcast.hosts"
            values={{ count: hosts.length }}
          />{' '}
          {hostsString}
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
