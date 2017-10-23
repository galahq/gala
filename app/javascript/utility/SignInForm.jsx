/**
 * @providesModule SignInForm
 * @flow
 */

import * as React from 'react'

import { Orchard } from 'shared/orchard'

class SignInForm extends React.Component<{}, { form: ?string }> {
  state = { form: null }

  componentDidMount () {
    Orchard.harvest('readers/sign_in').then(({ form }) =>
      this.setState({ form })
    )
  }

  render () {
    return (
      this.state.form && (
        <aside
          className="dialog"
          dangerouslySetInnerHTML={{ __html: this.state.form }}
        />
      )
    )
  }
}

export default SignInForm
