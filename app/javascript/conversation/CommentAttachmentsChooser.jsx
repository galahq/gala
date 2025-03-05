/**
 * An editable list of files to be attached to a comment
 *
 * @providesModule CommentAttachmentsChooser
 * @flow
 */

import * as React from 'react'
import produce from 'immer'
import styled from 'styled-components'
import { FormattedMessage } from 'react-intl'
import { Intent, ProgressBar, Tag } from '@blueprintjs/core'

import type { ActiveStorageFileUpload } from 'react-activestorage-provider'

type Props = {
  attachments: ActiveStorageFileUpload[],
  onChange: (File[]) => mixed,
}
const CommentAttachmentsChooser = ({ attachments, onChange }: Props) => {
  const files = attachments.map(attachment => attachment.file)

  return (
    <Container>
      <Tags>
        {attachments.map((attachment, i) => {
          const progress =
            attachment.state === 'finished'
              ? 1
              : attachment.state === 'uploading'
              ? attachment.progress / 100
              : 0
          return (
            <Tag
              minimal
              key={attachment.id}
              intent={
                attachment.state === 'error' ? Intent.DANGER : Intent.NONE
              }
              onRemove={() =>
                onChange(
                  produce(files, s => {
                    s.splice(i, 1)
                  })
                )
              }
            >
              {attachment.file.name}
              <ProgressBar value={progress} />
            </Tag>
          )
        })}
      </Tags>

      <ButtonLabel>
        <FileInput
          multiple
          onChange={(e: SyntheticInputEvent<*>) => {
            if (e.target.files.length > 0) {
              onChange([...files, ...e.target.files])
            }
          }}
        />
        <FormattedMessage id="comments.new.addAttachment" />
      </ButtonLabel>
    </Container>
  )
}

export default CommentAttachmentsChooser

const Container = styled.div`
  border-top: 1px solid rgba(16, 22, 26, 0.2);
  margin: 6px 0 -6px;
  padding: 6px 0;
`

const Tags = styled.div`
  margin-bottom: 6px;

  & > * {
    margin-right: 6px;
  }

  .bp3-progress-bar {
    border-radius: 2pt;
    bottom: 0;
    height: 100%;
    left: 0;
    mix-blend-mode: hard-light;
    position: absolute;

    .bp3-progress-meter {
      border-radius: 2pt;
    }
  }
`

const ButtonLabel = styled.label.attrs({
  className: 'bp3-button bp3-minimal bp3-icon-paperclip',
})``

const FileInput = styled.input.attrs({ type: 'file' })`
  opacity: 0;
  position: absolute;
`
