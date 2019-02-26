/**
 * @flow
 */

import SpotlightManager from '../SpotlightManager'

import { Orchard } from 'shared/orchard'

jest.mock('shared/orchard')

describe('SpotlightManager', () => {
  describe('#constructor', () => {
    it('is initialized with unacknowledged spotlights', () => {
      const manager = new SpotlightManager(['test_dummy'])

      expect(manager.unacknowledgedKeys).toEqual(['test_dummy'])
    })
  })

  describe('#subscribe', () => {
    it('sets an unacknowledged spotlight visible', () => {
      const manager = new SpotlightManager(['test_dummy'])

      const setVisibility = jest.fn()
      manager.subscribe({ key: 'test_dummy' }, setVisibility)
      expect(setVisibility).toHaveBeenCalledWith(true)
    })

    it('doesn’t set an acknowledged spotlight visible', () => {
      const manager = new SpotlightManager([])

      const setVisibility = jest.fn()
      manager.subscribe({ key: 'test_dummy' }, setVisibility)
      expect(setVisibility).not.toHaveBeenCalledWith(true)
    })

    it('sets a spotlight invisible when a higher priority one subscribes', () => {
      const manager = new SpotlightManager(['a', 'b'])

      const setB = jest.fn()
      manager.subscribe({ key: 'b' }, setB)
      const setA = jest.fn()
      manager.subscribe({ key: 'a' }, setA)

      expect(setB).toHaveBeenNthCalledWith(1, true)
      expect(setB).toHaveBeenNthCalledWith(2, false)
      expect(setA).toHaveBeenCalledWith(true)
    })

    it('sets the highest priority unacknowledged spotlight visible', () => {
      const manager = new SpotlightManager(['a', 'b', 'c'])

      let current = ''
      manager.subscribe({ key: 'b' }, visible => visible && (current = 'b'))
      manager.subscribe({ key: 'a' }, visible => visible && (current = 'a'))
      manager.subscribe({ key: 'c' }, visible => visible && (current = 'c'))

      expect(current).toEqual('a')
    })

  })

  describe('#unsubscribe', () => {
    it('sets the next highest priority unacknowledged spotlight visible when one unsubscribes', () => {
      const manager = new SpotlightManager(['a', 'b', 'c'])

      let current = ''
      manager.subscribe({ key: 'a' }, visible => visible && (current = 'a'))
      manager.subscribe({ key: 'b' }, visible => visible && (current = 'b'))
      manager.subscribe({ key: 'c' }, visible => visible && (current = 'c'))
      manager.unsubscribe({ key: 'b' })
      manager.unsubscribe({ key: 'a' })

      expect(current).toEqual('c')
    })

  })

  describe('#acknowledge', () => {
    it('sets the next highest priority unacknowledged spotlight visible when one is acknowledged', () => {
      const manager = new SpotlightManager(['a', 'b'])

      let current = ''
      manager.subscribe({ key: 'b' }, visible => visible && (current = 'b'))
      manager.subscribe({ key: 'a' }, visible => visible && (current = 'a'))
      manager.acknowledge('a')

      expect(current).toEqual('b')
    })

    it('makes a spotlight_acknowledgement#create request when one is acknowledged', () => {
      const manager = new SpotlightManager(['a'])

      manager.subscribe({ key: 'a' }, jest.fn())
      manager.acknowledge('a')

      expect(Orchard.graft).toBeCalledWith('spotlight_acknowledgements', {
        spotlight_acknowledgement: { spotlight_key: 'a' },
      })
    })
  })
})
