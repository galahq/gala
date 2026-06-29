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
})
