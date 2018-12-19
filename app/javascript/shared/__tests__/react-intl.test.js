import { FormattedList } from '../react-intl'

import React from 'react'
import renderer from 'react-test-renderer'

jest.mock('react-intl', () => ({
  FormattedMessage: jest.fn(props => (
    <div data-component="FormattedMessage" {...props} />
  )),
}))

describe('FormattedList', () => {
  it('works with zero items', () => {
    const component = renderer.create(<FormattedList list={[]} />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('works with one item', () => {
    const component = renderer.create(<FormattedList list={['1']} />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('works with two items', () => {
    const component = renderer.create(<FormattedList list={['1', '2']} />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('works with three items', () => {
    const component = renderer.create(<FormattedList list={['1', '2', '3']} />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('can truncate when the list is too long', () => {
    const component = renderer.create(
      <FormattedList
        list={['1', '2', '3', '4', '5', '6']}
        truncate={{ after: 2, with: 'etc.' }}
      />
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('doesn’t truncate if the list is short enough', () => {
    const component = renderer.create(
      <FormattedList
        list={['1', '2', '3', '4']}
        truncate={{ after: 5, with: 'etc.' }}
      />
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
