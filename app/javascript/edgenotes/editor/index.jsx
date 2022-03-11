/**
 * @providesModule EdgenoteEditor
 * @flow
 */

import * as React from 'react'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage } from 'react-intl'

import {
  changeEdgenote,
  updateLinkExpansionVisibility,
  displayErrorToast,
} from 'redux/actions'
import withVisibilityChanges from './withVisibilityChanges'
import { Overlay, EditButton } from './styled'
import EditorDialog from './EditorDialog'
import Attachment from './Attachment'

import type { IntlShape } from 'react-intl'
import type { Edgenote } from 'redux/state'
import type { VisibilityChangeProps } from './withVisibilityChanges'

type ChangeToAttachment = ?Attachment
export type ChangesToAttachments = {|
  audioUrl: ChangeToAttachment,
  fileUrl: ChangeToAttachment,
  imageUrl: ChangeToAttachment,
|}

type Props = {
  changeEdgenote: typeof changeEdgenote,
  contents: Edgenote,
  intl: IntlShape,
  locked: boolean,
  slug: string,
  updateLinkExpansionVisibility: typeof updateLinkExpansionVisibility,
  displayErrorToast: typeof displayErrorToast,
  onChange: ($Shape<Edgenote>) => Promise<any>,
  onClose?: () => void,
  onOpen?: () => void,
  ...VisibilityChangeProps,
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
    changesToAttachments: {
      audioUrl: undefined,
      fileUrl: undefined,
      imageUrl: undefined,
    },
  }

  componentWillUnmount() {
    Object.keys(this.state.changesToAttachments).forEach(key => {
      const attachment = this.state.changesToAttachments[key]
      attachment && attachment.cleanup()
    })
  }

  render() {
    const { intl, setVisibility, visibility } = this.props
    const { changesToAttachments, contents, open } = this.state
    return (
      <>
        <Overlay>
          <EditButton onClick={this.handleOpen}>
            <FormattedMessage id="helpers.edit" />
          </EditButton>
        </Overlay>

        <EditorDialog
          changesToAttachments={changesToAttachments}
          contents={contents}
          intl={intl}
          open={open}
          setVisibility={setVisibility}
          visibility={visibility}
          onChangeAttachment={this.handleChangeAttachment}
          onChangeContents={this.handleChangeContents}
          onClose={this.handleClose}
          onSubmit={this.handleSubmit}
        />
      </>
    )
  }

  handleOpen = () => this.setState({ open: true }, this.props.onOpen)
  handleClose = () =>
    this._close()
      .then(this._reset())
      .then(this.props.onClose)

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

  //const showSubmitWarning = (contents, attachments ) => (contents.attribution || contents.photoCredit) && !attachments.imageUrl

  handleSubmit = () => {
    const {
      slug,
      changeEdgenote,
      updateLinkExpansionVisibility,
      visibility,
      displayErrorToast,
    } = this.props
    const { contents, changesToAttachments } = this.state
    if (
      Boolean(
        (contents.photoCredit.length == 0 || contents.altText == null) &&
          (changesToAttachments.imageUrl != null || contents.imageUrl != null)
      )
    ) {
      //warn if true
      window.confirm("your photo is bad because stuff isn't there...")
    }
    console.log(contents)
    console.log(changesToAttachments)
    this._close()
      .then(() => updateLinkExpansionVisibility(slug, visibility))
      .then(() =>
        changeEdgenote(
          slug,
          ({
            ...contents,
            ...changesToAttachments,
          }: $FlowIssue)
        )
      )
      .then(this._reset)
      .then(this.props.onClose)
      .catch(e => {
        displayErrorToast(e.message)
        this.setState({ open: true })
      })
  }

  _close = () => new Promise(resolve => this.setState({ open: false }, resolve))
  _reset = () => this.setState({ contents: this.props.contents })
}
export default compose(
  connect(null, {
    changeEdgenote,
    updateLinkExpansionVisibility,
    displayErrorToast,
  }),
  withVisibilityChanges,
  injectIntl
)(EdgenoteEditor)
