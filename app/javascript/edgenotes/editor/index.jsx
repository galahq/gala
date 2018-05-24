/**
 * @providesModule EdgenoteEditor
 * @flow
 */

import * as React from 'react'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage } from 'react-intl'

import { changeEdgenote, updateLinkExpansionVisibility } from 'redux/actions'
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
  imageUrl: ChangeToAttachment,
|}

type Props = {
  changeEdgenote: typeof changeEdgenote,
  contents: Edgenote,
  intl: IntlShape,
  slug: string,
  updateLinkExpansionVisibility: typeof updateLinkExpansionVisibility,
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
    const { intl, toggleVisibility, visibility } = this.props
    const { changesToAttachments, contents, open } = this.state
    return (
      <React.Fragment>
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
          toggleVisibility={toggleVisibility}
          visibility={visibility}
          onChangeAttachment={this.handleChangeAttachment}
          onChangeContents={this.handleChangeContents}
          onClose={this.handleClose}
          onSubmit={this.handleSubmit}
        />
      </React.Fragment>
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

  handleSubmit = () => {
    const {
      slug,
      changeEdgenote,
      updateLinkExpansionVisibility,
      visibility,
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
          }: $FlowIssue)
        )
      )
      .then(this._reset)
      .then(this.props.onClose)
  }

  _close = () => new Promise(resolve => this.setState({ open: false }, resolve))
  _reset = () => this.setState({ contents: this.props.contents })
}
export default compose(
  connect(null, { changeEdgenote, updateLinkExpansionVisibility }),
  withVisibilityChanges,
  injectIntl
)(EdgenoteEditor)
