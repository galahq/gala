/**
 * @flow
 */

import { FormattedList } from '../react-intl'

import React from 'react'
import { render } from 'react-testing-library'

import { IntlProvider } from 'react-intl'
import loadMessages from '../../../../config/locales'

async function renderWithTranslations (node, options) {
  let messages = await loadMessages('en')
  return render(
    <IntlProvider locale="en" messages={messages}>
      {node}
    </IntlProvider>
  )
}

describe('FormattedList', () => {
  it('works with zero items', async () => {
    const { container } = await renderWithTranslations(
      <FormattedList list={[]} />
    )
    expect(container).toHaveTextContent(/^$/)
  })

  it('works with one item', async () => {
    const { container } = await renderWithTranslations(
      <FormattedList list={['1']} />
    )
    expect(container).toHaveTextContent(/^1$/)
  })

  it('works with two items', async () => {
    const { container } = await renderWithTranslations(
      <FormattedList list={['1', '2']} />
    )
    expect(container).toHaveTextContent(/^1 and 2$/)
  })

  it('works with three items', async () => {
    const { container } = await renderWithTranslations(
      <FormattedList list={['1', '2', '3']} />
    )
    expect(container).toHaveTextContent(/^1, 2, and 3$/)
  })

  it('can truncate when the list is too long', async () => {
    const { container } = await renderWithTranslations(
      <FormattedList
        list={['1', '2', '3', '4', '5', '6']}
        truncate={{ after: 2, with: 'etc.' }}
      />
    )
    expect(container).toHaveTextContent(/^1, 2, etc.$/)
  })

  it('doesn’t truncate if the list is short enough', async () => {
    const { container } = await renderWithTranslations(
      <FormattedList
        list={['1', '2', '3', '4']}
        truncate={{ after: 5, with: 'etc.' }}
      />
    )
    expect(container).toHaveTextContent(/^1, 2, 3, and 4$/)
  })
})
