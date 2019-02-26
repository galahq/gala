/**
 * @noflow
 */

import Spotlight from '../index'

import React from 'react'
import { fireEvent, render } from 'react-testing-library'

const mockSpotlightManager = mockVisibility => ({
  subscribe: jest.fn((_, setVisibility) => setVisibility(mockVisibility)),
  unsubscribe: jest.fn(),
  acknowledge: jest.fn(),
})

describe('Spotlight', () => {
  describe('that the user should not see', () => {
    it('only renders the target element', () => {
      window.spotlightManager = mockSpotlightManager(false)

      const component = (
        <Spotlight
          content="This button does a thing!"
          spotlightKey="test_dummy"
        >
          button
        </Spotlight>
      )
      const { container } = render(component)

      expect(container).not.toHaveTextContent('This button does a thing!')
      expect(container).toHaveTextContent('button')
    })
  })

  describe('that the user should see', () => {
    it('includes the content and the target element', () => {
      window.spotlightManager = mockSpotlightManager(true)

      const component = (
        <Spotlight
          content="This button does a thing!"
          spotlightKey="test_dummy"
        >
          button
        </Spotlight>
      )
      const { container } = render(component)

      expect(container).toHaveTextContent('This button does a thing!')
      expect(container).toHaveTextContent('button')
    })

    it('calls acknowledge on the spotlight manager when the button is clicked', () => {
      window.spotlightManager = mockSpotlightManager(true)

      const component = (
        <Spotlight
          content="This button does a thing!"
          spotlightKey="test_dummy"
        >
          button
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
