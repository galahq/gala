/**
 * @providesModule Announcements
 * @flow
 */

import * as React from 'react'
import styled from 'styled-components'
import { Orchard } from 'shared/orchard'

import { CatalogDataContext } from 'catalog/catalogData'
import { ReaderDataContext } from 'catalog/readerData'

export default function Announcements () {
  const [{ announcements }, update] = React.useContext(CatalogDataContext)
  const { reader } = React.useContext(ReaderDataContext)

  if (announcements.length === 0) return null

  const [announcement] = announcements

  return (
    <Container>
      <InnerContainer>
        <a href={announcement.url}>{announcement.content}</a>
      </InnerContainer>

      {reader != null && (
        <Dismiss>
          <button
            className="pt-button pt-minimal pt-icon-cross pt-intent-primary"
            onClick={handleDismissAnnouncement}
          />
        </Dismiss>
      )}
    </Container>
  )

  async function handleDismissAnnouncement () {
    if (announcements.length === 0) return null

    await Orchard.graft(`announcements/${announcement.param}/dismissal`)

    update(draft => {
      draft.announcements.shift()
    })
  }
}

// $FlowFixMe
const Container = styled.aside.attrs({
  className: 'pt-callout pt-icon-star pt-elevation-2',
})`
  background-color: hsl(254, 100%, 87%);
  display: grid;
  font-size: 15px;
  grid-area: banner;
  grid-template-areas: 'message dismiss' 'message .';
  grid-template-columns: minmax(min-content, 60em);
  margin-bottom: 1.5em;

  &::before {
    color: hsl(254, 77%, 69%) !important;
    top: 14px !important;
  }
`

const InnerContainer = styled.div`
  color: hsl(254, 52%, 24%);
  grid-area: message;
  margin: 4px 0;

  a {
    color: inherit;
    display: block;

    &:hover {
      text-decoration: underline;
    }
  }
`

const Dismiss = styled.div`
  grid-area: dismiss;
  justify-self: flex-end;
`
