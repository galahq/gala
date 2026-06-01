/**
 * @providesModule SignInForm
 *
 * Presentational container that renders a server-rendered Devise sign-in form
 * (fetched HTML) inside a styled card. Used where the form is shown inline,
 * e.g. the case overview enrollment flow.
 */

import * as React from 'react'

export function SignInFormContainer ({ formContents }) {
  return (
    <aside
      className="pt-card pt-elevation-4 devise-card"
      dangerouslySetInnerHTML={{ __html: formContents }}
    />
  )
}
