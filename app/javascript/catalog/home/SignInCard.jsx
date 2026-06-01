/**
 * Static "How Gala Works" card shown to anonymous visitors in the catalog
 * sidebar. Summarizes the value proposition in three icon rows, with a primary
 * call to create an account and a secondary link to the sign-in page. Renders
 * no network request; both actions are plain links to the Devise pages.
 *
 * @providesModule SignInCard
 *
 */

import * as React from 'react'
import styled from 'styled-components'
import { FormattedMessage } from 'react-intl'

const FEATURES = [
  {
    icon: 'edit',
    tone: 'sand',
    titleId: 'createInnovateTitle',
    bodyId: 'createInnovateBody',
  },
  {
    icon: 'people',
    tone: 'sage',
    titleId: 'collaborateAdaptTitle',
    bodyId: 'collaborateAdaptBody',
  },
  {
    icon: 'presentation',
    tone: 'violet',
    titleId: 'teachShareTitle',
    bodyId: 'teachShareBody',
  },
]

const SignInCard = () => (
  <Card>
    <Header>
      <FormattedMessage id="catalog.signIn.header" defaultMessage="How Gala Works" />
    </Header>

    <Features>
      {FEATURES.map(({ icon, tone, titleId, bodyId }) => (
        <Feature key={titleId}>
          <Badge tone={tone}>
            <span
              className={`pt-icon-standard pt-icon-${icon} bp4-icon-standard bp4-icon-${icon}`}
            />
          </Badge>
          <div>
            <FeatureTitle>
              <FormattedMessage id={`catalog.signIn.${titleId}`} />
            </FeatureTitle>
            <FeatureBody>
              <FormattedMessage id={`catalog.signIn.${bodyId}`} />
            </FeatureBody>
          </div>
        </Feature>
      ))}
    </Features>

    <CreateAccountButton
      href="/readers/sign_up"
      className="pt-button bp4-button pt-intent-primary bp4-intent-primary"
    >
      <FormattedMessage
        id="catalog.signIn.createAccount"
        defaultMessage="Create a free account"
      />
    </CreateAccountButton>

    <Footer>
      <FormattedMessage
        id="catalog.signIn.alreadyHaveAccount"
        defaultMessage="Already have an account?"
      />{' '}
      <a href="/readers/sign_in">
        <FormattedMessage id="catalog.signIn.button" defaultMessage="Sign in" />
      </a>
    </Footer>
  </Card>
)

export default SignInCard

// Badge tones drawn from the brand palette in app/assets/stylesheets/_globals.sass
// ($lightBrown/$darkBrown, $lightGreen/$darkGreen, $purple/$darkPurple).
const TONES = {
  sand: { bg: '#EAD9C6', fg: '#7E5C3C' },
  sage: { bg: '#D3EBD6', fg: '#357E3C' },
  violet: { bg: '#E3DBF7', fg: '#493092' },
}

// Palette matches the shared .devise-card (app/assets/stylesheets/devise.scss).
const Card = styled.aside.attrs({ className: 'pt-card pt-elevation-4' })`
  background-color: hsl(255, 100%, 95%);
  border-top: 6px solid hsl(255, 64%, 63%);
  color: hsl(255, 43%, 43%);
  margin-bottom: 1.5em;
  max-width: 100%;
  padding: 1.5em;
  width: 22em;

  /* Keep the sign-up CTA in view while the reader scrolls the catalog. */
  position: sticky;
  top: 1.5em;

  /* On mobile the card is in normal flow above the content, so don't pin it.
     Also preserve the centering the shared .devise-card used to get here. */
  @media (max-width: 700px) {
    margin: 0 auto 1.5em;
    position: static;
  }
`

const Header = styled.h3`
  color: #7351d4;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.08em;
  margin: 0 0 1.25em;
  text-transform: uppercase;
`

const Features = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.1em;
  margin-bottom: 1.5em;
`

const Feature = styled.div`
  align-items: flex-start;
  display: flex;
  gap: 0.9em;
`

const Badge = styled.div`
  align-items: center;
  background-color: ${p => TONES[p.tone].bg};
  border-radius: 50%;
  color: ${p => TONES[p.tone].fg};
  display: flex;
  flex: 0 0 auto;
  height: 2.5em;
  justify-content: center;
  width: 2.5em;

  & > [class*='icon-'] {
    color: inherit;
  }
`

const FeatureTitle = styled.h4`
  color: #493092;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.2;
  margin: 0.1em 0 0.25em;
`

const FeatureBody = styled.p`
  color: hsl(255, 12%, 42%);
  font-size: 13.5px;
  line-height: 1.45;
  margin: 0;
`

// Layout only — let Blueprint's (purple-themed) pt-intent-primary supply the
// colors so this matches the standard “Sign in” button.
const CreateAccountButton = styled.a`
  &&& {
    display: flex;
    justify-content: center;
    padding: 0.65em 1em;
    width: 100%;
  }
`

const Footer = styled.p`
  color: hsl(255, 12%, 42%);
  font-size: 13px;
  margin: 1em 0 0;
  text-align: center;

  a {
    color: #7351d4;
    text-decoration: underline;
  }
`
