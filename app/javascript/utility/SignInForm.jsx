/**
 * @providesModule SignInForm
 * 
 */

import * as React from 'react'

import { Orchard } from 'shared/orchard'

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
      className="pt-card pt-elevation-4 devise-card"
      dangerouslySetInnerHTML={{ __html: formContents }}
    />
  )
}
