declare var Sentry: any
declare var sentryLog: (
  level: string,
  message: string,
  extra?: { [string]: mixed }
) => void
