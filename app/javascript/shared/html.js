/**
 * This helper does nothing but interpolate a tagged template literal like
 * normal. The trick is that it being called html allows Atom’s language-babel
 * package, and others like it, to use HTML syntax highlighting and indentation
 * rules inside the literals.
 *
 * @providesModule html
 * @flow
 */

// - strings is an array of the portions around the interpolations, like what
//   you would get if you split the string on ${...}
// - interpolations is an array of the portions inside the interpolations.
//
// strings has length >= 1 and interpolations will always be one element shorter
// than strings
export default function html (
  strings: string[],
  ...interpolations: string[]
): string {
  let interpolatedString = ''

  // Flow’s understanding of tagged template literals is incomplete :(
  // See https://github.com/facebook/flow/issues/4732
  // $FlowFixMe
  strings.raw.forEach((string, i) => {
    interpolatedString += string

    const interpolation = interpolations[i]
    if (interpolation != null) interpolatedString += `${interpolation}`
  })

  return interpolatedString
}
