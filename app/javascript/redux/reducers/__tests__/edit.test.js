/* @noflow */

import reduce from '../edit'

describe('edit reducer', () => {
  test('CLEAR_UNSAVED resets everything', () => {
    const state = {
      changed: true,
      unsavedChanges: {
        'cards/1': true,
        'pages/1': true,
      },
    }
    const action = { type: 'CLEAR_UNSAVED' }

    const result = reduce(state, action)

    expect(result.changed).toBeFalsy()
    expect(result.unsavedChanges['cards/1']).toBeFalsy()
    expect(result.unsavedChanges['pages/1']).toBeFalsy()
  })

  test('TOGGLE_EDITING works', () => {
    const action = { type: 'TOGGLE_EDITING' }

    expect(reduce({ inProgress: true }, action)).toMatchObject({
      inProgress: false,
    })
    expect(reduce({ inProgress: false }, action)).toMatchObject({
      inProgress: true,
    })
  })

  test.each`
    action                                           | key
    ${{ type: 'UPDATE_CASE' }}                       | ${'caseData'}
    ${{ type: 'UPDATE_CARD_CONTENTS', id: '1' }}     | ${'cards/1'}
    ${{ type: 'REORDER_CARD', id: '1' }}             | ${'cards/1'}
    ${{ type: 'UPDATE_PAGE', id: '1' }}              | ${'pages/1'}
    ${{ type: 'UPDATE_PODCAST', id: '1' }}           | ${'podcasts/1'}
    ${{ type: 'UPDATE_EDGENOTE', slug: 'abc' }}      | ${'edgenotes/abc'}
    ${{ type: 'UPDATE_SUGGESTED_QUIZ', param: '1' }} | ${'quizzes/1'}
  `('$action sets unsavedChanges[$key]', ({ action, key }) => {
    const state = { changed: false, unsavedChanges: {}}
    expect(reduce(state, action).changed).toBeTruthy()
    expect(reduce(state, action).unsavedChanges[key]).toBeTruthy()
  })

  test.each`
    action                                                          | key
    ${{ type: 'UPDATE_CASE', needsSaving: false }}                  | ${'caseData'}
    ${{ type: 'UPDATE_PAGE', id: '1', needsSaving: false }}         | ${'pages/1'}
    ${{ type: 'UPDATE_PODCAST', id: '1', needsSaving: false }}      | ${'podcasts/1'}
    ${{ type: 'UPDATE_EDGENOTE', slug: 'abc', needsSaving: false }} | ${'edgenotes/abc'}
  `('$action does not set unsavedChanges[$key]', ({ action, key }) => {
    const state = { unsavedChanges: {}}
    expect(reduce(state, action).unsavedChanges[key]).toBeFalsy()
  })

  test('ENQUEUE_LOCK_FOR_DELETION works', () => {
    const state = { locksToDelete: [] }
    const action = { type: 'ENQUEUE_LOCK_FOR_DELETION', gid: 'asdf' }
    expect(reduce(state, action).locksToDelete).toEqual(['asdf'])
  })

  test('REMOVE_LOCK_FROM_DELETION_QUEUE works', () => {
    const state = { locksToDelete: ['a', 'b', 'c'] }
    const action = { type: 'REMOVE_LOCK_FROM_DELETION_QUEUE', gid: 'b' }
    expect(reduce(state, action).locksToDelete).toEqual(['a', 'c'])
  })

  test.each`
    action                                             | key
    ${{ type: 'REMOVE_CARD', id: '1' }}                | ${'cards/1'}
    ${{ type: 'REMOVE_EDGENOTE', slug: 'abc' }}        | ${'edgenotes/abc'}
    ${{ type: 'REMOVE_SUGGESTED_QUIZ', param: 'abc' }} | ${'quizzes/abc'}
  `('$action unsets unsavedChanges[$key]', ({ action, key }) => {
    const state = { unsavedChanges: { [key]: true }}
    expect(reduce(state, action).unsavedChanges[key]).toBeFalsy()
  })
})
