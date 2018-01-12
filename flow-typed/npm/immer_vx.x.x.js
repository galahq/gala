declare module 'immer' {
  declare export default function produce<T>(
    baseState: T,
    producer: (T) => mixed
  ): T

  declare export function setAutoFreeze(boolean): void
}
