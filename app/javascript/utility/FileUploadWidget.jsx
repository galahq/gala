/**
 * @providesModule FileUploadWidget
 * @flow
 */

import * as React from 'react'
import styled from 'styled-components'

import { FormattedMessage } from 'react-intl'

import type { MessageDescriptor } from 'react-intl'
import type { ActiveStorageFileUpload } from 'react-activestorage-provider'

type Props = {
  handleUpload: FileList => void,
  ready: boolean,
  uploads: ActiveStorageFileUpload[],
  className?: string,
  message: MessageDescriptor,
  accept?: string,
}
const FileUploadWidget = ({
  handleUpload,
  uploads,
  ready,
  className,
  message,
  accept,
}: Props) => (
  <>
    <label className={className} style={{ display: ready ? 'block' : 'none' }}>
      <HiddenFileUpload
        accept={accept || 'image/*'}
        onChange={e => handleUpload(e.currentTarget.files)}
      />
      <UploadButton>
        <FormattedMessage {...message} />
      </UploadButton>
    </label>

    {uploads.map(
      upload =>
        upload.state === 'uploading' && (
          <ProgressBar key={upload.id}>
            <div
              className="pt-progress-meter"
              style={{ width: `${upload.progress}%` }}
            />
          </ProgressBar>
        )
    )}
  </>
)

export default FileUploadWidget

export const PositionedFileUploadWidget = styled(FileUploadWidget)`
  position: absolute;
  top: 10px;
  right: 10px;
`

const HiddenFileUpload = styled.input.attrs({ type: 'file' })`
  opacity: 0;
  left: -99999px;
  margin: 0;
  min-width: 1em;
  position: absolute;
`

const UploadButton = styled.span.attrs({
  className: 'pt-button pt-icon-cloud-upload',
})``

const ProgressBar = styled.div.attrs({
  className: 'pt-progress-bar pt-intent-success',
})`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
`
