/**
 *
 */

import SpotlightManager from '../SpotlightManager'

import { Orchard } from 'shared/orchard'

vi.mock('shared/orchard')

describe('SpotlightManager', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  describe('#constructor', () => {
    it('is initialized with unacknowledged spotlights', () => {
      const manager = new SpotlightManager(['test_dummy'])

      expect(manager.unacknowledgedKeys).toEqual(['test_dummy'])
    })

    it('defaults to being enabled', () => {
      const manager = new SpotlightManager([])

      expect(manager.enabled).toBeTruthy()
    })

    it('can be initialized with a starting enabled state', () => {
      const manager = new SpotlightManager([], { enabled: false })

      expect(manager.enabled).toBeFalsy()
    })
  })

  describe('#enabled', () => {
    it('sets a spotlight visible only after the SpotlightManager has been enabled', () => {
      const manager = new SpotlightManager(['test_dummy'], { enabled: false })

      const setVisibility = jest.fn()
      manager.subscribe({ key: 'test_dummy' }, setVisibility)
      expect(setVisibility).not.toHaveBeenCalledWith(true)

      manager.enabled = true
      expect(setVisibility).toHaveBeenCalledWith(true)
    })

    it('sets a spotlight invisible when the SpotlightManager has been disabled', () => {
      const manager = new SpotlightManager(['test_dummy'])

      const setVisibility = jest.fn()
      manager.subscribe({ key: 'test_dummy' }, setVisibility)
      manager.enabled = false

      expect(setVisibility).toHaveBeenNthCalledWith(1, true)
      expect(setVisibility).toHaveBeenNthCalledWith(2, false)
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

    it('prioritizes spotlights with the same key by their document position', () => {
      const manager = new SpotlightManager(['a'])

      document.body.innerHTML = `
        <div id="a1"></div>
        <div id="a2"></div>
      `

      const setA2 = jest.fn()
      manager.subscribe(
        { key: 'a', ref: { current: document.getElementById('a2') }},
        setA2
      )
      const setA1 = jest.fn()
      manager.subscribe(
        { key: 'a', ref: { current: document.getElementById('a1') }},
        setA1
      )

      expect(setA2).toHaveBeenNthCalledWith(1, true)
      expect(setA2).toHaveBeenNthCalledWith(2, false)
      expect(setA1).toHaveBeenCalledWith(true)
    })

    it('keeps mounted targets ahead of targets whose refs were cleared', () => {
      const manager = new SpotlightManager(['a'])
      const mountedTarget = document.createElement('div')
      const clearedTarget = { current: null }
      const setMounted = jest.fn()

      manager.subscribe(
        { key: 'a', ref: { current: mountedTarget }},
        setMounted
      )

      expect(() => {
        manager.subscribe({ key: 'a', ref: clearedTarget }, jest.fn())
      }).not.toThrow()
      expect(setMounted).toHaveBeenCalledWith(true)
    })
  })

  describe('#unsubscribe', () => {
    it('sets the next highest priority unacknowledged spotlight visible when one unsubscribes', () => {
      const manager = new SpotlightManager(['a', 'b', 'c'])

      let current = ''

      const aRef = {}
      const bRef = {}
      const cRef = {}

      manager.subscribe(
        { key: 'a', ref: aRef},
        visible => visible && (current = 'a')
      )
      manager.subscribe(
        { key: 'b', ref: bRef},
        visible => visible && (current = 'b')
      )
      manager.subscribe(
        { key: 'c', ref: cRef},
        visible => visible && (current = 'c')
      )

      manager.unsubscribe({ key: 'b', ref: bRef})
      manager.unsubscribe({ key: 'a', ref: aRef})

      expect(current).toEqual('c')
    })

    it('removes the correct spotlight when there are more than one with a key', () => {
      const manager = new SpotlightManager(['a'])

      document.body.innerHTML = `
        <div id="a1"></div>
        <div id="a2"></div>
      `

      let current = ''
      const a1Ref = { current: document.getElementById('a1') }
      const a2Ref = { current: document.getElementById('a2') }
      manager.subscribe(
        { key: 'a', ref: a1Ref},
        visible => visible && (current = 'a1')
      )
      manager.subscribe(
        { key: 'a', ref: a2Ref},
        visible => visible && (current = 'a2')
      )
      manager.unsubscribe({ key: 'a', ref: a1Ref })

      expect(current).toEqual('a2')
    })

    it('removes only the matching subscription when refs have been cleared', () => {
      const manager = new SpotlightManager(['a'])
      const firstRef = { current: null }
      const secondRef = { current: null }
      const setSecond = jest.fn()

      manager.subscribe({ key: 'a', ref: firstRef }, jest.fn())
      manager.subscribe({ key: 'a', ref: secondRef }, setSecond)
      manager.unsubscribe({ key: 'a', ref: firstRef })

      expect(setSecond).toHaveBeenCalledWith(true)
    })
  })

  describe('#acknowledge', () => {
    it('sets a spotlight invisible when it is acknowledged', () => {
      const manager = new SpotlightManager(['a'])

      let set = jest.fn()
      manager.subscribe({ key: 'a' }, set)
      manager.acknowledge('a')

      expect(set).toHaveBeenNthCalledWith(1, true)
      expect(set).toHaveBeenNthCalledWith(2, false)
    })

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
