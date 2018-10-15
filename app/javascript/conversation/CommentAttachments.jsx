/**
 * An editable list of files attached to a comment
 *
 * @providesModule CommentAttachments
 * @flow
 */

import * as React from 'react'
import produce from 'immer'
import styled from 'styled-components'
import { FormattedMessage } from 'react-intl'
import { Tag } from '@blueprintjs/core'

type Props = { attachments: File[], onChange: (File[]) => mixed }
const CommentAttachments = ({ attachments, onChange }: Props) => (
  <Container>
    <Tags>
      {attachments.map((attachment, i) => (
        <Tag
          minimal
          key={i}
          onRemove={() => onChange(produce(attachments, s => s.splice(i, 1)))}
        >
          {attachment.name}
        </Tag>
      ))}
    </Tags>

    <ButtonLabel>
      <FileInput
        onChange={(e: SyntheticInputEvent<*>) => {
          if (e.target.files.length > 0) {
            onChange([...attachments, e.target.files.item(0)])
          }
        }}
      />
      <FormattedMessage id="comments.new.addAttachment" />
    </ButtonLabel>
  </Container>
)

export default CommentAttachments

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
`

const ButtonLabel = styled.label.attrs({
  className: 'pt-button pt-minimal pt-icon-paperclip',
})``

const FileInput = styled.input.attrs({ type: 'file' })`
  opacity: 0;
  position: absolute;
`
