/**
 * Pop up a dialog when the “edit” label is clicked to allow the straightforward
 * editing of an Edgenote.
 *
 * @providesModule EdgenoteEditor
 * @flow
 */

import * as React from 'react'
import styled from 'styled-components'
import { injectIntl, FormattedMessage } from 'react-intl'
import * as R from 'ramda'

import { Button, Dialog as BaseDialog, Intent } from '@blueprintjs/core'

import EdgenoteForm from './EdgenoteForm'
import { EdgenoteFigure } from 'edgenotes/Edgenote'
import Attachment from './Attachment'

import type { IntlShape } from 'react-intl'
import type { Edgenote } from 'redux/state'

type ChangeToAttachment = ?Attachment
export type ChangesToAttachments = {|
  audioUrl: ChangeToAttachment,
  imageUrl: ChangeToAttachment,
|}

type Props = {
  contents: Edgenote,
  intl: IntlShape,
  slug: string,
  onChange: ($Shape<Edgenote>) => Promise<any>,
}
type State = {
  open: boolean,
  contents: Edgenote,
  changesToAttachments: ChangesToAttachments,
}
class EdgenoteEditor extends React.Component<Props, State> {
  state = {
    open: false,
    contents: this.props.contents,
    changesToAttachments: { audioUrl: undefined, imageUrl: undefined },
  }

  componentWillReceiveProps (nextProps: Props) {
    if (this.props.slug !== nextProps.slug) {
      this.setState({ contents: nextProps.contents })
    }
  }

  componentWillUnmount () {
    Object.keys(this.state.changesToAttachments).forEach(key => {
      const attachment = this.state.changesToAttachments[key]
      attachment && attachment.cleanup()
    })
  }

  render () {
    return (
      <React.Fragment>
        {this.renderOverlay()}
        {this.renderDialog()}
      </React.Fragment>
    )
  }

  renderOverlay () {
    return (
      <Overlay>
        <EditButton onClick={this.handleOpen}>
          <FormattedMessage id="helpers.edit" />
        </EditButton>
      </Overlay>
    )
  }

  renderDialog () {
    const { intl } = this.props
    const { contents, open, changesToAttachments } = this.state

    return (
      <Dialog
        iconName="edit"
        isOpen={open}
        title={intl.formatMessage({ id: 'edgenotes.edit.editEdgenote' })}
        onClose={this.handleClose}
      >
        <Body>
          <Column>
            <EdgenoteForm
              contents={
                ({
                  ...contents,
                  ...R.filter(Boolean, changesToAttachments),
                }: $FlowIssue)
              }
              intl={intl}
              onChange={this.handleChangeContents}
              onChangeAttachment={this.handleChangeAttachment}
            />
          </Column>
          <Separator />
          <Column>
            <h5>
              <FormattedMessage id="edgenotes.edit.preview" />
            </h5>
            <Card>
              <EdgenoteFigure
                contents={this._displayPropsIncludingChangesToAttachments()}
                embedded={true}
              />
            </Card>
          </Column>
        </Body>
        <div className="pt-dialog-footer">
          <div className="pt-dialog-footer-actions">
            <Button
              text={intl.formatMessage({ id: 'helpers.cancel' })}
              onClick={this.handleClose}
            />
            <Button
              intent={Intent.SUCCESS}
              // TODO: onClick
              text={intl.formatMessage({ id: 'helpers.save' })}
            />
          </div>
        </div>
      </Dialog>
    )
  }

  handleOpen = () => this.setState({ open: true })
  handleClose = () =>
    this.setState({ contents: this.props.contents, open: false })

  handleChangeContents = (attributes: $Shape<Edgenote>) =>
    this.setState(({ contents }: State) => ({
      contents: { ...contents, ...attributes },
    }))

  handleChangeAttachment = (
    attribute: $Keys<ChangesToAttachments>,
    attachment: ?FileList
  ) => {
    const changeToAttachment =
      this.state.changesToAttachments[attribute] || new Attachment()
    changeToAttachment.fileList = attachment

    return this.setState(({ changesToAttachments }: State) => ({
      changesToAttachments: Object.freeze({
        ...changesToAttachments,
        [attribute]: changeToAttachment,
      }),
    }))
  }

  _displayPropsIncludingChangesToAttachments () {
    const { contents, changesToAttachments } = this.state
    const havingChanges = R.filter(Boolean)
    const objectUrls = R.map(attachment => attachment && attachment.objectUrl)
    return {
      ...contents,
      ...objectUrls(havingChanges(changesToAttachments)),
    }
  }
}
export default injectIntl(EdgenoteEditor)

const Overlay = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  border: none;
  background-color: transparent;

  opacity: 0;
  transition: opacity 0.1s ease-out;

  &:hover,
  &:focus-within {
    opacity: 1;
  }
`

const EditButton = styled(Button).attrs({
  intent: Intent.SUCCESS,
  iconName: 'edit',
})`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);

  box-shadow: 0 0 10px white;
`

const Dialog = styled(BaseDialog)`
  width: 772px;
`

const Body = styled.div.attrs({ className: 'pt-dialog-body' })`
  display: flex;
  flex-flow: row wrap;
`

const Column = styled.div`
  max-width: 350px;
`

const Separator = styled.div`
  padding: 1em;
`

const Card = styled.div.attrs({ className: 'pt-card pt-dark pt-elevation-3' })`
  & .edge {
    width: auto;
  }
`
