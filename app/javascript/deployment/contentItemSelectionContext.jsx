/**
 * Provider for methods and parameters related to an ongoing content item
 * selection session. During such a session, the app is being used in an iframe
 * in Canvas or another LTI Tool Consumer to select a case to be assigned. This
 * context allows the app to vary its appearance and to commit the selection.
 *
 * @flow
 */

import * as React from 'react'
import { submitForm } from 'shared/lti'
import { CSRF } from 'shared/orchard'

const defaultContext = { selecting: false, onSelect: () => {} }
const { Provider: BaseProvider, Consumer } = React.createContext(defaultContext)

type State = {
  params?: {
    lti_uid: string,
    return_url: string,
    return_data: string,
    context_id: string,
    canvas_deployments_path: string,
  },
}

export class Provider extends React.Component<{ children: React.Node }, State> {
  state = {
    params: window['content_item_selection_params'],
  }

  handleSelect = (caseSlug: string) => {
    const { params } = this.state
    if (!params) return

    submitForm(params.canvas_deployments_path, {
      case_slug: caseSlug,
      ...CSRF.param(),
    })
  }

  render () {
    return (
      <BaseProvider
        value={{
          selecting: !!this.state.params,
          onSelect: this.handleSelect,
        }}
      >
        {this.props.children}
      </BaseProvider>
    )
  }
}

export { Consumer }
