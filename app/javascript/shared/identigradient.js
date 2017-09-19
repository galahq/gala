/**
 * @flow
 */

import ColorHash from 'color-hash'

const hasher = new ColorHash()

type Triad = [number, number, number]

function hsl (text: string): Triad {
  return hasher.hsl(text)
}

function other ([h, s, l]: Triad): Triad {
  return [h - 40, s, l - 0.2]
}

function cssString ([h, s, l]: Triad): string {
  return `hsl(${h}, ${s * 100}%, ${l * 100}%)`
}

export function identicolor (text: string): string {
  return cssString(hsl(text))
}

export function identigradient (text: string): string {
  const one = hsl(text)
  const two = other(one)
  const direction = parseInt(one[0] * one[0])
  return `linear-gradient(${direction}deg,
                          ${cssString(one)},
                          ${cssString(two)})`
}
