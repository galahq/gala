/**
 * Handles the lifecycle of object URLs for file upload previews.
 * NOTE: It is the consumer’s responsibility to call `cleanup` when finished.
 *
 * @providesModule Attachment
 * @flow
 */

class Attachment {
  _fileList: ?FileList
  _objectUrl: ?string

  get fileList (): ?FileList {
    return this._fileList
  }

  set fileList (newFileList: ?FileList) {
    if (this._objectUrl) URL.revokeObjectURL(this.objectUrl)
    this._fileList = newFileList
    this._objectUrl =
      this._fileList && this._fileList.length > 0
        ? URL.createObjectURL(this._fileList.item(0))
        : null
  }

  get objectUrl (): string {
    return this._objectUrl || ''
  }

  cleanup () {
    this.fileList = null
  }
}

export default Attachment
