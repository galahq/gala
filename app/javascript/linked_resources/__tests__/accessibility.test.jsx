import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { IntlProvider } from 'react-intl'

import loadMessages from '../../../../config/locales'
import LinkedResourceDialog from '../LinkedResourceDialog'
import SortableLinkedResourceList from '../SortableLinkedResourceList'

let messages
beforeAll(async () => {
  messages = await loadMessages('en')
})

const renderWithIntl = ui =>
  render(
    <IntlProvider locale="en" messages={messages}>
      {ui}
    </IntlProvider>
  )

const resource = {
  id: 1,
  name: 'RAISE grant',
  connection: 'grant',
  connectionOther: null,
  description: 'Funded the fieldwork',
  identifiers: [{ type: 'doi', value: '10.1000/xyz123' }],
  position: 0,
}

describe('LinkedResourceDialog', () => {
  const renderDialog = () =>
    renderWithIntl(
      <LinkedResourceDialog
        isOpen
        resource={null}
        position={0}
        linkedResourcesPath="cases/x/linked_resources"
        onClose={() => {}}
        onSaved={() => {}}
      />
    )

  it('labels every field', () => {
    renderDialog()
    expect(screen.getByLabelText(/Resource Name/)).toBeTruthy()
    expect(screen.getByLabelText('Identifier 1 type')).toBeTruthy()
    expect(screen.getByLabelText('Identifier 1 value')).toBeTruthy()
    expect(screen.getByLabelText('Connection to this module')).toBeTruthy()
    expect(screen.getByRole('group', { name: /Identifiers/ })).toBeTruthy()
  })

  it('explains and focuses the first problem when saving an invalid form', async () => {
    renderDialog()
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    // The identifier comes first, so it’s the first problem
    const identifier = screen.getByLabelText('Identifier 1 value')
    await waitFor(() => expect(document.activeElement).toBe(identifier))
    expect(identifier.getAttribute('aria-invalid')).toBe('true')
    expect(screen.getByRole('alert').textContent).toMatch(/Fix the highlighted fields/)

    const name = screen.getByLabelText(/Resource Name/)
    expect(name.getAttribute('aria-invalid')).toBe('true')
    expect(document.getElementById(name.getAttribute('aria-describedby')).textContent)
      .toMatch(/Enter a name/)
  })

  it('puts the identifiers before the name', () => {
    renderDialog()
    const identifier = screen.getByLabelText('Identifier 1 value')
    const name = screen.getByLabelText(/Resource Name/)
    expect(
      identifier.compareDocumentPosition(name) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()
  })

  describe('name autofill', () => {
    beforeEach(() => fetch.resetMocks())

    const enterIdentifier = (type, value) => {
      fireEvent.change(screen.getByLabelText('Identifier 1 type'), {
        target: { value: type },
      })
      fireEvent.change(screen.getByLabelText('Identifier 1 value'), {
        target: { value },
      })
    }

    it('fills in the name from a DOI', async () => {
      fetch.mockResponseOnce(
        JSON.stringify({ title: 'Nanometre-scale thermometry in a living cell' })
      )
      renderDialog()
      enterIdentifier('doi', 'https://doi.org/10.1038/nature12373')

      const name = screen.getByLabelText(/Resource Name/)
      await waitFor(() =>
        expect(name.value).toBe('Nanometre-scale thermometry in a living cell')
      )
      expect(fetch.mock.calls[0][0]).toBe('https://doi.org/10.1038/nature12373')
      expect(
        document.getElementById(name.getAttribute('aria-describedby')).textContent
      ).toMatch(/from the DOI/)
    })

    it('fills in the name from a Wikidata QID', async () => {
      fetch.mockResponseOnce(
        JSON.stringify({
          entities: { Q2013: { labels: { en: { value: 'Wikidata' } } } },
        })
      )
      renderDialog()
      enterIdentifier('wikidata', 'q2013')

      await waitFor(() =>
        expect(screen.getByLabelText(/Resource Name/).value).toBe('Wikidata')
      )
      expect(fetch.mock.calls[0][0]).toMatch(/wikidata\.org.*ids=Q2013/)
    })

    it('doesn’t replace a name the author typed', async () => {
      fetch.mockResponseOnce(JSON.stringify({ title: 'Looked-up title' }))
      renderDialog()
      fireEvent.change(screen.getByLabelText(/Resource Name/), {
        target: { value: 'My own name' },
      })
      enterIdentifier('doi', '10.1038/nature12373')

      await waitFor(() => expect(fetch).toHaveBeenCalled())
      await new Promise(resolve => setTimeout(resolve, 50))
      expect(screen.getByLabelText(/Resource Name/).value).toBe('My own name')
    })

    it('warns about a DOI that doesn’t resolve, but still saves it', async () => {
      fetch
        .mockResponseOnce('', { status: 404 })
        .mockResponseOnce(JSON.stringify({ responseCode: 100 }), { status: 404 })
      renderDialog()
      enterIdentifier('doi', '10.1000/missing')

      const identifier = screen.getByLabelText('Identifier 1 value')
      await waitFor(() =>
        expect(identifier.getAttribute('aria-describedby')).toBeTruthy()
      )
      const warning = document.getElementById(
        identifier.getAttribute('aria-describedby')
      )
      expect(warning.textContent).toMatch(/couldn’t find this DOI/)
      expect(identifier.getAttribute('aria-invalid')).toBe('false')
      expect(screen.getByLabelText(/Resource Name/).value).toBe('')

      // A warning isn’t an error: with a name, the form saves
      fireEvent.change(screen.getByLabelText(/Resource Name/), {
        target: { value: 'Unregistered paper' },
      })
      fireEvent.click(screen.getByRole('button', { name: 'Save' }))
      await waitFor(() =>
        expect(screen.getByRole('alert').textContent).not.toMatch(
          /Fix the highlighted fields/
        )
      )
    })

    it('warns about a QID Wikidata doesn’t have', async () => {
      fetch.mockResponseOnce(
        JSON.stringify({ entities: { Q999999999: { missing: '' } } })
      )
      renderDialog()
      enterIdentifier('wikidata', 'Q999999999')

      const identifier = screen.getByLabelText('Identifier 1 value')
      await waitFor(() =>
        expect(identifier.getAttribute('aria-describedby')).toBeTruthy()
      )
      expect(
        document.getElementById(identifier.getAttribute('aria-describedby'))
          .textContent
      ).toMatch(/couldn’t find this Wikidata QID/)
    })
  })

  it('moves focus to a newly added identifier', async () => {
    renderDialog()
    fireEvent.click(screen.getByRole('button', { name: 'Add identifier' }))
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByLabelText('Identifier 2 value'))
    )
  })
})

describe('SortableLinkedResourceList', () => {
  const renderList = editing =>
    renderWithIntl(
      <SortableLinkedResourceList
        droppableId="test"
        editing={editing}
        items={[resource]}
        onReorder={() => {}}
        onEdit={() => {}}
        onRemove={() => {}}
      />
    )

  it('names the edit, delete, and reorder controls after the resource', () => {
    renderList(true)
    expect(screen.getByRole('button', { name: 'Edit RAISE grant' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Delete RAISE grant' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Reorder RAISE grant' })).toBeTruthy()
    expect(screen.getAllByRole('listitem')).toHaveLength(1)
  })

  it('discloses the details from a button that works without hover', async () => {
    renderList(false)
    const tag = screen.getByRole('button', { name: 'RAISE grant' })
    expect(tag.getAttribute('aria-expanded')).toBe('false')
    expect(tag.getAttribute('aria-haspopup')).toBe(null)

    const detailsId = tag.getAttribute('aria-controls')
    expect(detailsId).toBeTruthy()

    // fireEvent.click doesn’t focus the way a real click does, so focus the chip
    // first — otherwise “focus didn’t move” would pass trivially from <body>
    tag.focus()
    fireEvent.click(tag)
    await waitFor(() => expect(tag.getAttribute('aria-expanded')).toBe('true'))

    const details = document.getElementById(detailsId)
    expect(details).toBeTruthy()
    expect(details.textContent).toMatch(/Funded the fieldwork/)
    expect(details.textContent).toMatch(/opens in new tab/)
    // Focus stays on the chip; a disclosure doesn’t move it
    expect(document.activeElement).toBe(tag)
    expect(details.contains(document.activeElement)).toBe(false)
  })

  // A browser fires keydown AND a synthesised click for Enter/Space on a button.
  // If both toggle the popover it opens and immediately closes again.
  it.each(['Enter', ' '])('stays open when activated with %s', async key => {
    renderList(false)
    const tag = screen.getByRole('button', { name: 'RAISE grant' })

    tag.focus()
    fireEvent.keyDown(tag, { key })
    fireEvent.click(tag)

    await waitFor(() => expect(tag.getAttribute('aria-expanded')).toBe('true'))
    expect(
      document.getElementById(tag.getAttribute('aria-controls'))
    ).toBeTruthy()
  })
})
