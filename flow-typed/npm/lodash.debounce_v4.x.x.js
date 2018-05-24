declare type DebounceOptions = {
  leading?: boolean,
  maxWait?: number,
  trailing?: boolean,
}

declare module 'lodash.debounce' {
  declare module.exports: <F: Function>(
    func: F,
    wait?: number,
    options?: DebounceOptions
  ) => F
}
