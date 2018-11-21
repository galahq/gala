/* @noflow */

import reduce from '../pagesById'

const state = {
  '1': {
    id: '1',
    cards: ['1', '2', '3'],
    position: 1,
    title: 'Introduction',
    url: 'pages/1',
  },
  '2': {
    id: '2',
    cards: ['4', '5', '6'],
    position: 2,
    title: 'Conclusion',
    url: 'pages/2',
  },
}

describe('pagesById reducer', () => {
  describe('ReorderCardAction', () => {
    test('works', () => {
      const action = { type: 'REORDER_CARD', id: '2', destination: 0 }

      expect(reduce(state, action)).toEqual({
        '1': {
          id: '1',
          cards: ['2', '1', '3'],
          position: 1,
          title: 'Introduction',
          url: 'pages/1',
        },
        '2': {
          id: '2',
          cards: ['4', '5', '6'],
          position: 2,
          title: 'Conclusion',
          url: 'pages/2',
        },
      })
    })
  })
})
