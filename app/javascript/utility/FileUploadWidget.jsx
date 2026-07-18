/**
 * @providesModule FileUploadWidget
 *
 */

import * as React from 'react'
import styled from 'styled-components'

import { FormattedMessage } from 'react-intl'


const FileUploadWidget = ({
  handleUpload,
  uploads,
  ready,
  className,
  message,
  accept,
}) => (
  <>
    <label className={className} style={{ display: ready ? 'unset' : 'none' }}>
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
              className="bp6-progress-meter"
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
  left: 10px;
`

const HiddenFileUpload = styled.input.attrs({ type: 'file' })`
  opacity: 0;
  left: -99999px;
  margin: 0;
  min-width: 1em;
  position: absolute;
`

const UploadButton = styled.span.attrs({
  className: 'bp6-button bp6-icon-cloud-upload',
})``

const ProgressBar = styled.div.attrs({
  className: 'bp6-progress-bar bp6-intent-success',
})`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
`
