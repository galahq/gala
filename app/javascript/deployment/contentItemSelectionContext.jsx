/**
 * Provider for methods and parameters related to an ongoing content item
 * selection session. During such a session, the app is being used in an iframe
 * in Canvas or another LTI Tool Consumer to select a case to be assigned. This
 * context allows the app to vary its appearance and to commit the selection.
 *
 * @flow
 */

import * as React from 'react'

export type ContentItemSelectionContext = {
  selecting: boolean,
  onSelect: (caseSlug: string) => void,
}

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

  handleSelect = () => {}

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
