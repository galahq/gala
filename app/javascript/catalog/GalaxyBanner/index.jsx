/**
 * Let people know about our event.
 *
 * @providesModule GalaxyBanner
 * @flow
 */

import * as React from 'react'
import styled from 'styled-components'
import { LabelForScreenReaders } from 'utility/A11y.jsx'

const GalaxyBanner = () => (
  <Container>
    <GalaxyLogo dangerouslySetInnerHTML={{ __html: require('./galaxy.svg') }} />
    <LabelForScreenReaders>Galaxy 2018</LabelForScreenReaders>
    <Tagline>A sustainability learning exchange</Tagline>
    <Spacer />
    <Time>June 7–9</Time>
    <Button href="//galaxy.learngala.com">Learn more</Button>
  </Container>
)
export default GalaxyBanner

const Container = styled.aside.attrs({ className: 'pt-card pt-elevation-3' })`
  align-items: center;
  background-color: #02284b;
  background-image: url(${() => require('./stars.png')});
  background-position: center;
  background-size: 1315px;
  color: white;
  display: flex;
  flex-flow: row wrap;
  grid-area: banner;
  justify-content: center;
  margin-bottom: 1.5em;
  padding: 1rem 1.5rem;
`

const GalaxyLogo = styled.span.attrs({ role: 'presentation' })`
  svg {
    fill: white;
    margin-bottom: -10px;
    width: 150px;
  }
`

const Tagline = styled.p`
  font-family: freight-text-pro;
  font-size: 135%;
  font-style: italic;
  font-weight: 500;
  margin: 1px 0 0 1em;
`

const Spacer = styled.div`
  flex: 1;

  @media (max-width: 1050px) {
    flex-basis: 100%;
    height: 12px;
  }
`

const Time = styled.p`
  font-weight: 600;
  margin: 0 1em -1px 0;
`

const Button = styled.a.attrs({ className: 'pt-button pt-intent-primary' })``
