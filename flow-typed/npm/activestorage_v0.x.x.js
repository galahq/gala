declare module 'activestorage' {
  declare module.exports: {
    start(): void,
  }
}

declare type InitializeEvent = {
  target: HTMLInputElement,
  detail: { id: string, file: File },
} & Event

declare type ProgressEvent = {
  target: HTMLInputElement,
  detail: { id: string, file: File, progress: number },
} & Event

declare type ErrorEvent = {
  target: HTMLInputElement,
  detail: { id: string, file: File, error: string },
} & Event

declare type EndEvent = {
  target: HTMLInputElement,
  detail: { id: string, file: File },
}

declare function addEventListener(
  'direct-upload:initialize',
  (InitializeEvent) => mixed
): void
declare function addEventListener(
  'direct-upload:progress',
  (ProgressEvent) => mixed
): void
declare function addEventListener(
  'direct-upload:error',
  (ErrorEvent) => mixed
): void
declare function addEventListener(
  'direct-upload:end',
  (EndEvent) => mixed
): void
