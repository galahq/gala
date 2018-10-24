declare module 'activestorage' {
  declare export function start(): void

  declare export class DirectUpload {
    id: number;
    file: File;
    url: string;

    constructor(
      file: File,
      url: string,
      delegate: {
        +directUploadWillCreateBlobWithXHR?: (xhr: XMLHttpRequest) => mixed,
        +directUploadWillStoreFileWithXHR?: (xhr: XMLHttpRequest) => mixed,
      }
    ): DirectUpload;

    create(
      callback: (
        error: Error,
        blob: {
          byte_size: number,
          checksum: string,
          content_type: string,
          filename: string,
          signed_id: string,
        }
      ) => mixed
    ): void;
  }
}

declare type $ActiveStorage$DirectUploadInitializeEvent = {
  target: HTMLInputElement,
  detail: { id: string, file: File },
} & Event

declare type $ActiveStorage$DirectUploadProgressEvent = {
  target: HTMLInputElement,
  detail: { id: string, file: File, progress: number },
} & Event

declare type $ActiveStorage$DirectUploadErrorEvent = {
  target: HTMLInputElement,
  detail: { id: string, file: File, error: string },
} & Event

declare type $ActiveStorage$DirectUploadEndEvent = {
  target: HTMLInputElement,
  detail: { id: string, file: File },
}

declare function addEventListener(
  'direct-upload:initialize',
  ($ActiveStorage$DirectUploadInitializeEvent) => mixed
): void
declare function addEventListener(
  'direct-upload:progress',
  ($ActiveStorage$DirectUploadProgressEvent) => mixed
): void
declare function addEventListener(
  'direct-upload:error',
  ($ActiveStorage$DirectUploadErrorEvent) => mixed
): void
declare function addEventListener(
  'direct-upload:end',
  ($ActiveStorage$DirectUploadEndEvent) => mixed
): void
