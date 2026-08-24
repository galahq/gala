/**
 * @providesModule SignInForm
 *
 * Presentational container that renders a server-rendered Devise sign-in form
 * (fetched HTML) inside a styled card. Used where the form is shown inline,
 * e.g. the case overview enrollment flow.
 */

import * as React from 'react'

import { Orchard } from 'shared/orchard'

// Self-fetching sign-in form: harvests the server-rendered Devise form and
// renders it in the styled card.
export default function SignInForm () {
  const [formContents, setFormContents] = React.useState(null)

  React.useEffect(() => {
    Orchard.harvest('readers/sign_in').then(({ form }) => setFormContents(form))
  }, [])

  return formContents && <SignInFormContainer formContents={formContents} />
}

export function SignInFormContainer ({ formContents }) {
  return (
    <aside
      className="bp6-card bp6-elevation-4 devise-card"
      dangerouslySetInnerHTML={{ __html: formContents }}
    />
  )
}
