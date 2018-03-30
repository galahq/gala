/**
 * Pop up a dialog when the “edit” label is clicked to allow the straightforward
 * editing of an Edgenote.
 *
 * @providesModule EditorDialog
 * @flow
 */

import * as React from 'react'
import * as R from 'ramda'
import { Button, Intent } from '@blueprintjs/core'
import { Dialog, Body, Column, Separator } from './styled'
import withExpansion from 'edgenotes/expansion/withExpansion'
import EdgenoteForm from './EdgenoteForm'
import EdgenotePreview from './EdgenotePreview'
import ExpansionVisibilityForm from './ExpansionVisibilityForm'

import type { IntlShape } from 'react-intl'
import type { Edgenote, LinkExpansionVisibility } from 'redux/state'
import type { ILinkExpansion } from 'edgenotes/expansion/LinkExpansion'
import type { ChangesToAttachments } from './index'
import type { VisibilityChangeProps } from './withVisibilityChanges'

type Props = {
  changesToAttachments: ChangesToAttachments,
  contents: Edgenote,
  expansion: ILinkExpansion,
  intl: IntlShape,
  open: boolean,
  onChangeAttachment: (
    attribute: $Keys<ChangesToAttachments>,
    attachment: ?FileList
  ) => mixed,
  onChangeContents: ($Shape<Edgenote>) => mixed,
  onClose: () => Promise<mixed>,
  onSubmit: () => mixed,
  ...VisibilityChangeProps,
}

const EditorDialog = ({
  changesToAttachments,
  contents,
  expansion,
  intl,
  open,
  toggleVisibility,
  visibility,
  onChangeAttachment,
  onChangeContents,
  onClose,
  onSubmit,
}: Props) => {
  const contentsWithAttachmentChanges = ({
    ...contents,
    ...R.filter(Boolean, changesToAttachments),
  }: $FlowIssue)
  const expansionWithVisibilityChanges = expansion.previewVisibility(visibility)

  return (
    <Dialog
      icon="edit"
      isOpen={open}
      title={intl.formatMessage({ id: 'edgenotes.edit.editEdgenote' })}
      onClose={onClose}
    >
      <Body>
        <Column>
          <EdgenoteForm
            contents={contentsWithAttachmentChanges}
            expansion={expansionWithVisibilityChanges}
            intl={intl}
            onChange={onChangeContents}
            onChangeAttachment={onChangeAttachment}
          />
        </Column>

        <Separator />

        <Column>
          <EdgenotePreview
            contents={contents}
            changesToAttachments={changesToAttachments}
            expansion={expansionWithVisibilityChanges}
          />

          <ExpansionVisibilityForm
            contents={contentsWithAttachmentChanges}
            expansion={expansion}
            toggleVisibility={toggleVisibility}
            visibility={visibility}
          />
        </Column>
      </Body>
      <div className="pt-dialog-footer">
        <div className="pt-dialog-footer-actions">
          <Button
            text={intl.formatMessage({ id: 'helpers.cancel' })}
            onClick={onClose}
          />
          <Button
            intent={Intent.SUCCESS}
            text={intl.formatMessage({ id: 'helpers.save' })}
            onClick={onSubmit}
          />
        </div>
      </div>
    </Dialog>
  )
}

export default withExpansion(EditorDialog)
