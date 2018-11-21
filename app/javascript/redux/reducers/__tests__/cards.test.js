/* @noflow */

import reduce from '../cards'

const state = {
  '1': {
    id: '1',
    pageId: '1',
    position: 1,
  },
  '2': {
    id: '2',
    pageId: '1',
    position: 2,
  },
  '3': {
    id: '3',
    pageId: '1',
    position: 3,
  },
  '4': {
    id: '4',
    pageId: '1',
    position: 4,
  },
  '5': {
    id: '5',
    pageId: '2',
    position: 1,
  },
}

describe('cardsById reducer', () => {
  describe('ReplaceCardAction', () => {
    test('reorders cards as needed', () => {
      const action = {
        type: 'REPLACE_CARD',
        cardId: '3',
        newCard: { id: '3', pageId: '1', position: 2, solid: true },
      }

      expect(reduce(state, action)).toMatchObject({
        '1': {
          id: '1',
          pageId: '1',
          position: 1,
        },
        '2': {
          id: '2',
          pageId: '1',
          position: 3, // <-
        },
        '3': {
          id: '3',
          pageId: '1',
          position: 2, // <-
          solid: true, // <-
          editorState: expect.anything(), // hydrated, blank
        },
        '4': {
          id: '4',
          pageId: '1',
          position: 4,
        },
        '5': {
          id: '5',
          pageId: '2',
          position: 1,
        },
      })
    })
  })

  describe('ReorderCardAction', () => {
    test('works going up', () => {
      const action = { type: 'REORDER_CARD', id: '3', destination: 1 }

      expect(reduce(state, action)).toEqual({
        '1': {
          id: '1',
          pageId: '1',
          position: 1,
        },
        '2': {
          id: '2',
          pageId: '1',
          position: 3, // <-
        },
        '3': {
          id: '3',
          pageId: '1',
          position: 2, // <-
        },
        '4': {
          id: '4',
          pageId: '1',
          position: 4,
        },
        '5': {
          id: '5',
          pageId: '2',
          position: 1,
        },
      })
    })

    test('works going down', () => {
      const action = { type: 'REORDER_CARD', id: '2', destination: 2 }

      expect(reduce(state, action)).toEqual({
        '1': {
          id: '1',
          pageId: '1',
          position: 1,
        },
        '2': {
          id: '2',
          pageId: '1',
          position: 3, // <-
        },
        '3': {
          id: '3',
          pageId: '1',
          position: 2, // <-
        },
        '4': {
          id: '4',
          pageId: '1',
          position: 4,
        },
        '5': {
          id: '5',
          pageId: '2',
          position: 1,
        },
      })
    })
  })
})
