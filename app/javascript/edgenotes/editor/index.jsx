/**
 * @providesModule EdgenoteEditor
 * 
 */

import * as React from 'react'
import { compose } from 'redux'
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





class EdgenoteEditor extends React.Component {
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

  handleChangeContents = (attributes) =>
    this.setState(({ contents }) => ({
      contents: { ...contents, ...attributes },
    }))

  handleChangeAttachment = (
    attribute,
    attachment
  ) => {
    const changeToAttachment =
      this.state.changesToAttachments[attribute] || new Attachment()
    changeToAttachment.fileList = attachment

    return this.setState(({ changesToAttachments }) => ({
      changesToAttachments: Object.freeze({
        ...changesToAttachments,
        [attribute]: changeToAttachment,
      }),
    }))
  }

  handleSubmit = () => {
    const {
      slug,
      changeEdgenote,
      updateLinkExpansionVisibility,
      visibility,
      displayErrorToast,
    } = this.props
    const { contents, changesToAttachments } = this.state

    this._close()
      .then(() => updateLinkExpansionVisibility(slug, visibility))
      .then(() =>
        changeEdgenote(
          slug,
          ({
            ...contents,
            ...changesToAttachments,
          })
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
