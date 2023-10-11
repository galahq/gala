/**
 * @providesModule LibraryRequests
 * @flow
 */

import * as React from 'react'
import styled from 'styled-components'
import { injectIntl } from 'react-intl'

import { Orchard } from 'shared/orchard'
import { CatalogDataContext } from 'catalog/catalogData'
import { ReaderDataContext } from 'catalog/readerData'

import type { IntlShape } from 'react-intl'

function LibraryRequests ({ intl }: { intl: IntlShape }) {
  const [{ libraryRequests }, update] = React.useContext(CatalogDataContext)
  const { reader } = React.useContext(ReaderDataContext)

  if (libraryRequests.length === 0) return null

  const [libraryRequest] = libraryRequests

  return (
    <Container>
      <InnerContainer>
        <a href={libraryRequest.url}>
          <b>{libraryRequest.requesterName}</b> has requested{' '}
          <b>{libraryRequest.caseKicker}</b> be added to the{' '}
          <b>{libraryRequest.libraryName}</b> library.
        </a>
      </InnerContainer>

      {reader != null && (
        <Dismiss>
          <button
            aria-label={intl.formatMessage({
              id: 'announcements.dismissals.create.dismissAnnouncement',
            })}
            className="pt-button pt-minimal pt-icon-cross pt-intent-primary"
            onClick={console.log}
          />
        </Dismiss>
      )}
    </Container>
  )

  async function handleDismissAnnouncement () {
    if (announcement == null) return

    await Orchard.graft(`announcements/${announcement.param}/dismissal`)

    update(draft => {
      if (draft.announcements[0]?.param !== announcement.param) return

      draft.announcements.shift()
    })
  }
}

export default injectIntl(LibraryRequests)

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
