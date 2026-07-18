/**
 * @providesModule CreditsListForm
 *
 */

import * as React from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'

import { Button, Dialog, Intent } from '@blueprintjs/core'

import { displayToast } from 'redux/actions'
import { isCompact, areObjectsCompact } from 'shared/functions'

import SortableList, { createSortableInput } from 'utility/SortableList'


class CreditsListForm extends React.Component {
  constructor (props) {
    super(props)

    const { guests, hosts } = props.credits
    this.state = { guests, hosts }
  }

  handleChangeHosts = (hosts) => {
    this.setState({ hosts })
  }

  handleChangeGuests = (guests) => {
    this.setState({ guests })
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
    const { guests, hosts } = this.state
    return (
      <Dialog
        isOpen={editing}
        icon="edit"
        className="bp6-dark"
        title="Editing podcast credits"
        style={{ width: 700 }}
        onClose={this.handleCancel}
      >
        <div className="bp6-dialog-body">
          <SectionTitle>Guests</SectionTitle>
          <SortableList
            dark
            items={guests}
            newItem={{ name: '', title: '' }}
            render={GuestInput}
            onChange={this.handleChangeGuests}
          />

          <SectionTitle>Hosts</SectionTitle>
          <SortableList
            dark
            items={hosts}
            newItem=""
            render={HostInput}
            onChange={this.handleChangeHosts}
          />
        </div>
        <div className="bp6-dialog-footer">
          <div className="bp6-dialog-footer-actions">
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

export default connect(
  undefined,
  { displayToast }
)(CreditsListForm)

function formStateClean ({ guests, hosts }) {
  return areObjectsCompact(guests) && isCompact(hosts)
}

const HostInput = createSortableInput({ placeholder: 'Host name' })

const GuestInput = ({ item, onChangeItem }) => (
  <span style={{ display: 'flex' }}>
    <input
      className="bp6-input"
      type="text"
      placeholder="Guest name"
      value={item.name}
      onChange={(e) => {
        onChangeItem({ ...item, name: e.target.value })
      }}
    />

    <input
      className="bp6-input"
      style={{ flexGrow: 1 }}
      type="text"
      placeholder="Guest title"
      value={item.title}
      onChange={(e) => {
        onChangeItem({ ...item, title: e.target.value })
      }}
    />
  </span>
)

const SectionTitle = styled.h5`
  &:not(:first-child) {
    margin-top: 2em;
  }
`
