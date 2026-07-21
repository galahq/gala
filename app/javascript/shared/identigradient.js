/**
 * 
 */

import ColorHash from 'color-hash'

const hasher = new ColorHash()


function hsl (text) {
  return hasher.hsl(text)
}

function other ([h, s, l]) {
  return [h - 40, s, l - 0.2]
}

function cssString ([h, s, l]) {
  return `hsl(${h}, ${s * 100}%, ${l * 100}%)`
}

export function identicolor (text) {
  return cssString(hsl(text))
}

export function identigradient (text) {
  const one = hsl(text)
  const two = other(one)
  const direction = parseInt(one[0] * one[0])
  return `linear-gradient(${direction}deg,
                          ${cssString(one)},
                          ${cssString(two)})`
}
