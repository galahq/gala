/**
 * A form with a button that enrolls a user in a particular deployment of a
 * case whether or not they have an account.
 *
 * @providesModule MagicLin
 *
 */

import React from 'react'
import styled from 'styled-components'
import { FormattedMessage } from 'react-intl'

const MagicLink = ({ deploymentKey }) => {
  return (
    <form action="/magic_link" method="POST">
      <input type="hidden" name="deployment_key" value={deploymentKey} />

      <Button>
        <FormattedMessage id="magicLink.show.letsGetStarted" />
      </Button>
    </form>
  )
}

export default MagicLink

const Button = styled.button.attrs({
  className: 'bp6-button bp6-large bp6-intent-success',
  type: 'submit',
})`
  box-shadow: 0 0 2px white, 0 0 1px 4px #80ff8933, 0 0 5px 7px #92ec9933 !important;
  font-weight: 600;
  letter-spacing: 0.2px;
  margin: 2em;
`
