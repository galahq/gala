/* @flow */

import { groupKeywords } from '../helpers'

describe('groupKeywords', () => {
  test('works', () => {
    const keywords = [
      { displayName: 'Apples', name: 'Apples' },
      { displayName: 'Bananas', name: 'Bananas' },
      { displayName: 'Avocados', name: 'Avocados' },
    ]

    expect(groupKeywords(keywords)).toEqual([
      [
        { displayName: 'Apples', name: 'Apples' },
        { displayName: 'Avocados', name: 'Avocados' },
      ],
      [{ displayName: 'Bananas', name: 'Bananas' }],
    ])
  })

  test('uses displayName so the keywords can be translated', () => {
    const keywords = [
      { displayName: 'Pommes', name: 'Apples' },
      { displayName: 'Bananes', name: 'Bananas' },
      { displayName: 'Poires', name: 'Pears' },
    ]

    expect(groupKeywords(keywords)).toEqual([
      [{ displayName: 'Bananes', name: 'Bananas' }],
      [
        { displayName: 'Poires', name: 'Pears' },
        { displayName: 'Pommes', name: 'Apples' },
      ],
    ])
  })
})
