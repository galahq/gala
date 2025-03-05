/**
 * Pop up a dialog when the “edit” label is clicked to allow the straightforward
 * editing of an Edgenote.
 *
 * @providesModule EditorDialog
 * @flow
 */

import * as React from 'react'
import * as R from 'ramda'
import { FormattedMessage } from 'react-intl'
import { Button, FormGroup, Intent, RadioGroup, Radio } from '@blueprintjs/core'
import { Dialog, Body, Column, Separator } from './styled'
import withExpansion from 'edgenotes/expansion/withExpansion'
import EdgenoteForm from './EdgenoteForm'
import EdgenotePreview from './EdgenotePreview'
import ExpansionVisibilityForm from './ExpansionVisibilityForm'

import type { IntlShape } from 'react-intl'
import type { Edgenote } from 'redux/state'
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
  setVisibility,
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
      canEscapeKeyClose={false}
      canOutsideClickClose={false}
      layout={contents.layout}
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

        <Column sticky layout={contents.layout}>
          <EdgenotePreview
            contents={contents}
            changesToAttachments={changesToAttachments}
            expansion={expansionWithVisibilityChanges}
          />
          <h5>
            <FormattedMessage id={'edgenotes.edit.layoutLabel'} />
          </h5>
          <RadioGroup
            label={<FormattedMessage id="edgenotes.edit.layoutPositionLabel" />}
            selectedValue={contents.layout}
            onChange={e =>
              onChangeContents({
                ...contents,
                layout: e.currentTarget.value,
              })
            }
          >
            <Radio
              label={intl.formatMessage({
                id: 'edgenotes.edit.layoutOptions.right',
              })}
              value="right"
            />
            <Radio
              label={intl.formatMessage({
                id: 'edgenotes.edit.layoutOptions.bottom',
              })}
              value="bottom"
            />
            <Radio
              label={intl.formatMessage({
                id: 'edgenotes.edit.layoutOptions.bottomFullWidth',
              })}
              value="bottom_full_width"
            />
          </RadioGroup>

          <ExpansionVisibilityForm
            contents={contentsWithAttachmentChanges}
            expansion={expansion}
            setVisibility={setVisibility}
            visibility={visibility}
          />
        </Column>
      </Body>
      <div className="bp3-dialog-footer">
        <div className="bp3-dialog-footer-actions">
          <a
            className="bp3-button bp3-icon-help"
            href="https://docs.learngala.com/docs"
            target="_blank"
            rel="noopener noreferrer"
            style={{ marginLeft: 0 }}
          >
            <FormattedMessage id="helpers.help" />
          </a>
          <div style={{ flex: 1 }} />
          <Button
            text={intl.formatMessage({ id: 'helpers.cancel' })}
            onClick={onClose}
          />
          <Button
            intent={Intent.SUCCESS}
            text={intl.formatMessage({ id: 'edgenotes.edit.saveEdgenote' })}
            onClick={onSubmit}
          />
        </div>
      </div>
    </Dialog>
  )
}

// $FlowFixMe
export default withExpansion(EditorDialog)
