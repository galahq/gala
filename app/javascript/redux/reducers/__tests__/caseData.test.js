/* @noflow */

import reducer from '../caseData.js'

describe('caseData reducer', () => {
  describe('AddPageAction', () => {
    test('works', () => {
      const state = {
        caseElements: [{ id: 1, position: 1 }, { id: 2, position: 2 }],
      }
      const action = {
        type: 'ADD_PAGE',
        data: { caseElement: { id: 3, position: 2 }},
      }

      expect(reducer(state, action)).toEqual({
        caseElements: [
          { id: 1, position: 1 },
          { id: 3, position: 2 },
          { id: 2, position: 2 },
        ],
      })
    })
  })
})
