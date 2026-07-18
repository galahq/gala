/**
 * @providesModule Announcements
 *
 */

import * as React from 'react'
import styled from 'styled-components'
import { injectIntl } from 'react-intl'

import { Orchard, ignoreClientError } from 'shared/orchard'
import { CatalogDataContext } from 'catalog/catalogData'
import { ReaderDataContext } from 'catalog/readerData'


function Announcements ({ intl }) {
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
            aria-label={intl.formatMessage({
              id: 'announcements.dismissals.create.dismissAnnouncement',
            })}
            className="bp6-button bp6-minimal bp6-icon-cross bp6-intent-primary"
            onClick={handleDismissAnnouncement}
          />
        </Dismiss>
      )}
    </Container>
  )

  async function handleDismissAnnouncement () {
    if (announcement == null) return

    try {
      await Orchard.graft(`announcements/${announcement.param}/dismissal`)
    } catch (e) {
      ignoreClientError(e) // 404 if the announcement was removed server-side
    }

    update(draft => {
      if (draft.announcements[0]?.param !== announcement.param) return

      draft.announcements.shift()
    })
  }
}

export default injectIntl(Announcements)

const Container = styled.aside.attrs({
  className: 'bp6-callout bp6-icon-star bp6-elevation-2',
})`
  /* BP6's .bp6-callout:not(.bp6-minimal) (specificity 0,2,0) sets a gray
     background that would otherwise clobber this brand lavender; !important
     restores it, matching the icon-color override below. */
  background-color: hsl(254, 100%, 87%) !important;
  display: grid;
  font-size: 15px;
  grid-area: banner;
  grid-template-areas: 'message dismiss' 'message .';
  grid-template-columns: minmax(min-content, 60em);
  margin-bottom: 1.5em;

  &::before {
    color: hsl(254, 77%, 69%) !important;
    /* Center the 20px star on the single line of 15px text. BP6's callout icon
       metrics differ from BP2's, so the old 14px rode ~7px too high. */
    top: 21px !important;
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
