declare module 'lodash.throttle' {
  declare module.exports: <Args, Returns>(
    callback: (Args) => Returns,
    maximumFrequency: number
  ) => Args => Returns
}
