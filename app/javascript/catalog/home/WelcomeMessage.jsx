/**
 * Welcome message that changes depending on if the reader is signed in
 *
 * @providesModule WelcomeMessage
 * @flow
 */

import * as React from 'react'
import styled from 'styled-components'
import { FormattedMessage } from 'react-intl'
import { Link } from 'react-router-dom'

const aboutLinks = [
  {
    message: 'findACaseButtonText',
    icon: 'search',
    href: 'https://www.learngala.com/my_cases',
  },
  {
    message: 'createACaseButtonText',
    icon: 'annotation',
    to: 'https://www.learngala.com/catalog/search',
  },
]

function AboutLinksList(props) {
  const linksList = props.links
  const links = linksList.map((link, index) => (
    <li key={index}>
      <a
        href={link.href}
        className={`aboutLinks pt-button pt-minimal pt-icon-${link.icon}`}
      >
        <FormattedMessage id={`catalog.welcomeMessage.${link.message}`} />
      </a>
    </li>
  ))

  return <ul>{links}</ul>
}

const getStartedMsg = (
  <>
    <div className="titleSection">
      <h1>
        <FormattedMessage id="catalog.welcomeMessage.welcomeTitle" />
      </h1>
      <AboutLinksList links={aboutLinks} />
    </div>
  </>
)

const welcomeBackMsg = (
  <>
    <div className="titleSection">
      <h1>
        <FormattedMessage id="catalog.welcomeMessage.welcomeBackTitle" />
      </h1>
    </div>
    <AboutLinksList links={aboutLinks} />
  </>
)

export default function WelcomeMessage() {
  return <Container>{reader ? welcomeBackMsg : getStartedMsg}</Container>
}

// $FlowFixMe
const Container = styled.aside.attrs({ className: 'pt-dark' })`
  color: white;
  font-family: tenso;
  grid-area: welcome-message;
  hyphens: auto;

  ul {
    display: inline-block;
    position: relative;
    bottom: 1px;
    padding-left: 0px;
  }

  ul > li {
    display: inline-block;
    list-style: none;
  }

  h1 {
    color: inherit;
    font-family: inherit;
    line-height: 1.2;
    font-size: 170%;

    hyphens: none;
    display: inline;
    margin-right: 1.7rem;
  }

  @media (max-width: 800px) {
    h1 {
      display: block;
      margin-right: 0rem;
      margin-bottom: 0rem;
    }

    ul {
    }
  }

  a {
    color: white;
    font-weight: bold;
  }

  a:hover {
    color: white;
    text-decoration: underline;
  }

  .titleSection {
    margin-bottom: 0.5rem;
    display: inline;
  }

  .aboutLinks {
    font-size: 100%;
  }

  .getStartedContained {
    max-width: 720px;
  }
`
