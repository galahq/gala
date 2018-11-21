/* @flow */

import { reorder } from '../functions'

describe('reorder', () => {
  it('works', () => {
    const array = 'abcd'.split('')
    expect(reorder(1, 2, array)).toEqual('acbd'.split(''))
  })
})
