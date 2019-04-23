/**
 * @providesModule Announcements
 * @flow
 */

import * as React from 'react'
import styled from 'styled-components'

export default function Announcements () {
  return (
    <Container>
      <InnerContainer>
        <a href="https://google.com">
          Join us for a chat with Kevin Savetz and Steve Meretzky about
          developing video games for Infocom in the 1980s. Join us for a chat
          with Kevin Savetz and Steve Meretzky about developing video games for
          Infocom in the 1980s.
        </a>
      </InnerContainer>

      <Dismiss>
        <button className="pt-button pt-minimal pt-icon-cross pt-intent-primary" />
      </Dismiss>
    </Container>
  )
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
