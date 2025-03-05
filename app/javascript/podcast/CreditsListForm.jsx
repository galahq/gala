/**
 * @providesModule CreditsListForm
 * @flow
 */

import * as React from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'

import { Button, Dialog, Intent } from '@blueprintjs/core'

import { displayToast } from 'redux/actions'
import { isCompact, areObjectsCompact } from 'shared/functions'

import SortableList, { createSortableInput } from 'utility/SortableList'

import type { Toast } from '@blueprintjs/core'
import type { PodcastCreditList } from 'redux/state'
type Guest = { name: string, title: string }

type Props = {
  editing: boolean,
  credits: PodcastCreditList,
  displayToast: Toast => any,
  onFinishEditing: (?CreditsListFormState) => void,
}
export type CreditsListFormState = { guests: Guest[], hosts: string[] }
class CreditsListForm extends React.Component<Props, CreditsListFormState> {
  constructor (props: Props) {
    super(props)

    const { guests, hosts } = props.credits
    this.state = { guests, hosts }
  }

  handleChangeHosts = (hosts: string[]) => {
    this.setState({ hosts })
  }

  handleChangeGuests = (guests: Guest[]) => {
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
        className="bp3-dark"
        title="Editing podcast credits"
        style={{ width: 700 }}
        onClose={this.handleCancel}
      >
        <div className="bp3-dialog-body">
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
        <div className="bp3-dialog-footer">
          <div className="bp3-dialog-footer-actions">
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

function formStateClean ({ guests, hosts }: CreditsListFormState): boolean {
  return areObjectsCompact(guests) && isCompact(hosts)
}

const HostInput = createSortableInput({ placeholder: 'Host name' })

type GuestInputProps = { item: Guest, onChangeItem: Guest => void }
const GuestInput = ({ item, onChangeItem }: GuestInputProps) => (
  <span style={{ display: 'flex' }}>
    <input
      className="bp3-input"
      type="text"
      placeholder="Guest name"
      value={item.name}
      onChange={(e: SyntheticInputEvent<*>) => {
        onChangeItem({ ...item, name: e.target.value })
      }}
    />

    <input
      className="bp3-input"
      style={{ flexGrow: 1 }}
      type="text"
      placeholder="Guest title"
      value={item.title}
      onChange={(e: SyntheticInputEvent<*>) => {
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
