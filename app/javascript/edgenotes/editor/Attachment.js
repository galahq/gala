/**
 * Handles the lifecycle of object URLs for file upload previews.
 * NOTE: It is the consumer’s responsibility to call `cleanup` when finished.
 *
 * @providesModule Attachment
 * @flow
 */

import { DirectUpload } from 'activestorage'
import { Orchard } from 'shared/orchard'

class Attachment {
  static truthy (attachment: ?Attachment | string) {
    return (
      attachment != null &&
      (typeof attachment === 'string' || !!attachment.objectUrl)
    )
  }

  _fileList: ?FileList
  _objectUrl: ?string

  get fileList (): ?FileList {
    return this._fileList
  }

  set fileList (newFileList: ?FileList) {
    if (this._objectUrl) URL.revokeObjectURL(this.objectUrl)
    this._fileList = newFileList

    const file = this._file()
    this._objectUrl = file ? URL.createObjectURL(file) : null
  }

  get objectUrl (): string {
    return this._objectUrl || ''
  }

  save ({
    detachEndpoint,
    onProgress,
  }: {
    detachEndpoint: string,
    onProgress?: number => mixed,
  }): Promise<string> {
    const file = this._file()
    if (file) return uploadBlob(file, onProgress)
    else return detachBlob(detachEndpoint).then(() => '')
  }

  cleanup () {
    this.fileList = null
  }

  _file () {
    return this._fileList && this._fileList.length > 0
      ? this._fileList.item(0)
      : null
  }

  _upload (onProgress?: number => mixed) {}
}

export default Attachment

function uploadBlob (file: File, onProgress?: number => mixed): Promise<string> {
  return new Promise((resolve, reject) => {
    const upload = new DirectUpload(
      file,
      '/rails/active_storage/direct_uploads',
      {
        directUploadWillStoreFileWithXHR: xhr => {
          xhr.upload.addEventListener('progress', (event: ProgressEvent) => {
            const progress = (event.loaded / event.total) * 100
            onProgress && progress && onProgress(progress)
          })
        },
      }
    )

    upload.create((error, blob) =>
      error ? reject(error) : resolve(blob.signed_id)
    )
  })
}

async function detachBlob (endpoint: string) {
  return Orchard.prune(endpoint)
}
