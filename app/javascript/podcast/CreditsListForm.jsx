/**
 * @providesModule CreditsListForm
 * @flow
 */

import React from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'
import { compose, isEmpty, map, none, values, flatten } from 'ramda'

import { Button, Dialog, Intent } from '@blueprintjs/core'

import { displayToast } from 'redux/actions'

import SortableList from 'utility/SortableList'

import type { Toast } from '@blueprintjs/core'
import type { PodcastCreditList } from 'redux/state'
type Guest = { name: string, title: string }

type Props = {
  editing: boolean,
  credits: PodcastCreditList,
  displayToast: Toast => void,
  onFinishEditing: (?CreditsListFormState) => void,
}
export type CreditsListFormState = { guests: Guest[], hosts: string[] }
class CreditsListForm extends React.Component {
  props: Props
  state: CreditsListFormState

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

  handleCancel = (e: SyntheticEvent) => {
    this.props.onFinishEditing(null)
  }

  handleDone = (e: SyntheticEvent) => {
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
        iconName="edit"
        className="pt-dark"
        title="Editing podcast credits"
        style={{ width: 700 }}
        onClose={this.handleCancel}
      >
        <div className="pt-dialog-body">
          <SectionTitle>Guests</SectionTitle>
          <SortableList
            items={guests}
            newItem={{ name: '', title: '' }}
            render={GuestInput}
            onChange={this.handleChangeGuests}
          />

          <SectionTitle>Hosts</SectionTitle>
          <SortableList
            items={hosts}
            newItem=""
            render={HostInput}
            onChange={this.handleChangeHosts}
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

export default connect(undefined, { displayToast })(CreditsListForm)

const listValues = map(values)
const isCompact = none(isEmpty)

// $FlowFixMe
const areObjectsCompact = compose(isCompact, flatten, listValues)

function formStateClean ({ guests, hosts }: CreditsListFormState): boolean {
  return areObjectsCompact(guests) && isCompact(hosts)
}

type HostInputProps = { item: string, onChangeItem: string => void }
const HostInput = ({ item, onChangeItem }: HostInputProps) =>
  <input
    className="pt-input"
    type="text"
    placeholder="Host name"
    value={item}
    onChange={(e: SyntheticInputEvent) => onChangeItem(e.target.value)}
  />

type GuestInputProps = { item: Guest, onChangeItem: Guest => void }
const GuestInput = ({ item, onChangeItem }: GuestInputProps) =>
  <span style={{ display: 'flex' }}>
    <input
      className="pt-input"
      type="text"
      placeholder="Guest name"
      value={item.name}
      onChange={(e: SyntheticInputEvent) => {
        onChangeItem({ ...item, name: e.target.value })
      }}
    />

    <input
      className="pt-input"
      style={{ flexGrow: 1 }}
      type="text"
      placeholder="Guest title"
      value={item.title}
      onChange={(e: SyntheticInputEvent) => {
        onChangeItem({ ...item, title: e.target.value })
      }}
    />
  </span>

const SectionTitle = styled.h5`
  &:not(:first-child) {
    margin-top: 2em;
  }
`
