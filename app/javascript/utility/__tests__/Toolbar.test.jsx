/*  */

import React from 'react'
import { render } from '@testing-library/react'
import { IntlProvider } from 'react-intl'

import Toolbar from '../Toolbar'

function renderToolbar (props = {}) {
  return render(
    <IntlProvider
      locale="en"
      messages={{
        'toolbar.home': 'Home',
        'toolbar.cases': 'My Cases',
        'toolbar.deployments': 'My Deployments',
      }}
    >
      <Toolbar
        canBeIconsOnly={false}
        groups={[
          [
            { message: 'toolbar.home', icon: 'home', onClick: jest.fn() },
            { message: 'toolbar.cases', icon: 'annotation', onClick: jest.fn() },
          ],
          [],
          [
            {
              message: 'toolbar.deployments',
              icon: 'follower',
              onClick: jest.fn(),
            },
          ],
        ]}
        {...props}
      />
    </IntlProvider>
  )
}

describe('Toolbar', () => {
  it('renders the shared toolbar contract classes for deterministic navbar styling', () => {
    const { container, getByText } = renderToolbar()

    expect(container.querySelector('.Toolbar__bar')).toBeTruthy()
    expect(container.querySelector('.Toolbar__bar > .MaxWidthContainer')).toBeTruthy()
    expect(container.querySelectorAll('.Toolbar__group')).toHaveLength(3)
    expect(container.querySelectorAll('.Toolbar__item')).toHaveLength(3)

    const homeButton = getByText('Home').closest('button')
    expect(homeButton).toHaveClass('Toolbar__item')
    expect(homeButton).toHaveClass('bp6-minimal')
    expect(homeButton).toHaveClass('bp6-minimal')
  })

  describe('spotlight wiring', () => {
    let originalManager

    beforeEach(() => {
      originalManager = window.spotlightManager
    })

    afterEach(() => {
      window.spotlightManager = originalManager
    })

    // Regression guard. Blueprint 6 removed Button's `elementRef` prop in
    // favour of forwardRef, so passing elementRef drops the ref silently.
    // useSpotlightManager then bails on its `ref.current == null` guard and
    // never subscribes — the spotlight simply never appears, with no error.
    // That shipped in the BP4→BP6 upgrade and broke every toolbar spotlight
    // (add_collaborators, publish, deploy, first-caselog).
    it('hands the spotlight a ref that resolves to the rendered button', () => {
      const subscribe = jest.fn()
      window.spotlightManager = {
        unacknowledgedKeys: ['add_collaborators'],
        subscribe,
        unsubscribe: jest.fn(),
        acknowledge: jest.fn(),
      }

      renderToolbar({
        groups: [
          [
            {
              message: 'toolbar.home',
              icon: 'home',
              onClick: jest.fn(),
              spotlightKey: 'add_collaborators',
            },
          ],
        ],
      })

      expect(subscribe).toHaveBeenCalled()

      const [options] = subscribe.mock.calls[0]
      expect(options.key).toBe('add_collaborators')
      expect(options.ref.current).toBeInstanceOf(HTMLElement)
    })
  })
})
