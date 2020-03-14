/**
 * @noflow
 */

import Spotlight from '../index'

import React from 'react'
import { fireEvent, render } from 'react-testing-library'

jest.mock('react-popper', () => ({
  Manager ({ children }) {
    return children
  },
  Reference ({ children }) {
    return children({ ref: () => {} })
  },
  Popper ({ children }) {
    return children({
      ref: () => {},
      style: {},
      placement: 'bottom',
      arrowProps: { ref: () => {}, style: {}},
    })
  },
}))

const mockSpotlightManager = mockVisibility => ({
  subscribe: jest.fn((_, setVisibility) => setVisibility(mockVisibility)),
  unsubscribe: jest.fn(),
  acknowledge: jest.fn(),
})

xdescribe('Spotlight', () => {
  describe('that the user should not see', () => {
    it('only renders the target element', () => {
      window.spotlightManager = mockSpotlightManager(false)

      const component = (
        <Spotlight
          content="This button does a thing!"
          spotlightKey="test_dummy"
        >
          {({ ref }) => <button ref={ref}>button</button>}
        </Spotlight>
      )
      const { baseElement } = render(component)

      expect(baseElement).not.toHaveTextContent('This button does a thing!')
      expect(baseElement).toHaveTextContent('button')
    })
  })

  describe('that the user should see', () => {
    it('includes the content and the target element', async () => {
      window.spotlightManager = mockSpotlightManager(true)

      const component = (
        <Spotlight
          content="This button does a thing!"
          spotlightKey="test_dummy"
        >
          {({ ref }) => <button ref={ref}>button</button>}
        </Spotlight>
      )
      const { baseElement } = render(component)

      expect(baseElement).toHaveTextContent('button')
      expect(baseElement).toHaveTextContent('This button does a thing!')
    })

    it('calls acknowledge on the spotlight manager when the button is clicked', () => {
      window.spotlightManager = mockSpotlightManager(true)

      const component = (
        <Spotlight
          content="This button does a thing!"
          spotlightKey="test_dummy"
        >
          {({ ref }) => <button ref={ref}>button</button>}
        </Spotlight>
      )
      const { getByTestId } = render(component)

      fireEvent.click(getByTestId('spotlight-acknowledge'))

      expect(window.spotlightManager.acknowledge).toHaveBeenCalledWith(
        'test_dummy'
      )
    })
  })
})
