/**
 * @providesModule SignInForm
 * @flow
 */

import * as React from 'react'

import { Orchard } from 'shared/orchard'

export default function SignInForm () {
  const [formContents, setFormContents] = React.useState<string | null>(null)

  React.useEffect(() => {
    Orchard.harvest('readers/sign_in').then(({ form }) => setFormContents(form))
  }, [])

  return formContents && <SignInFormContainer formContents={formContents} />
}

type Props = { formContents: string }
export function SignInFormContainer ({ formContents }: Props) {
  return (
    <aside
      className="bp4-card bp4-elevation-4 devise-card"
      dangerouslySetInnerHTML={{ __html: formContents }}
    />
  )
}
