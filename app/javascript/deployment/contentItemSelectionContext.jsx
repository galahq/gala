/**
 * Provider for methods and parameters related to an ongoing content item
 * selection session. During such a session, the app is being used in an iframe
 * in Canvas or another LTI Tool Consumer to select a case to be assigned. This
 * context allows the app to vary its appearance and to commit the selection.
 *
 * 
 */

import * as React from 'react'
import { submitForm } from 'shared/lti'
import { Orchard } from 'shared/orchard'

const defaultContext = { selecting: false, onSelect: (caseSlug) => {} }
const { Provider: BaseProvider, Consumer } = React.createContext(defaultContext)


function getContentItemSelectionParams () {
  return window['content_item_selection_params']
}

export class Provider extends React.Component {
  state = {
    params: getContentItemSelectionParams(),
  }

  componentDidMount () {
    if (this.state.params) this.ensurePresentedWithinIframe()
  }

  handleSelect = (caseSlug) => {
    const { params } = this.state
    if (!params) return

    submitForm(params.canvas_deployments_path, {
      case_slug: caseSlug,
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

  ensurePresentedWithinIframe () {
    if (window.self === window.top) {
      Orchard.prune('/catalog/content_items/session').then(() =>
        this.setState({ params: undefined })
      )
    }
  }
}

export { Consumer }
