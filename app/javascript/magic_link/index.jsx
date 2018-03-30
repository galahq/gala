/**
 * A form with a button that enrolls a user in a particular deployment of a
 * case whether or not they have an account.
 *
 * @providesModule MagicLin
 * @flow
 */

import React from 'react'
import styled from 'styled-components'
import { FormattedMessage } from 'react-intl'
import { CSRF } from 'shared/orchard'

type Props = { deploymentKey: string }

const MagicLink = ({ deploymentKey }: Props) => {
  const csrfObj = CSRF.param()
  return (
    <form action="/magic_link" method="POST">
      <input type="hidden" name="deployment_key" value={deploymentKey} />

      {Object.keys(csrfObj).map(name => (
        <input key={name} type="hidden" name={name} value={csrfObj[name]} />
      ))}

      <Button>
        <FormattedMessage id="magicLink.show.letsGetStarted" />
      </Button>
    </form>
  )
}

export default MagicLink

const Button = styled.button.attrs({
  className: 'pt-button pt-large pt-intent-success',
  type: 'submit',
})`
  margin: 2em;
`
