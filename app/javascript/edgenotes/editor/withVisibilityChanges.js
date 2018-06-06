/**
 * Keep track of changes to link expansion visibility
 * @providesModule withVisibilityChanges
 * @flow
 */

import { withStateHandlers } from 'recompose'

import type { HOC } from 'recompose'
import type { LinkExpansionVisibility } from 'redux/state'

export type VisibilityChangeProps = {|
  setVisibility: (key: $Keys<LinkExpansionVisibility>, value: boolean) => mixed,
  visibility: LinkExpansionVisibility,
|}

const enhance: HOC<*, VisibilityChangeProps> = withStateHandlers(
  { visibility: ({}: LinkExpansionVisibility) },
  {
    setVisibility: ({ visibility }) => (key, value) => ({
      visibility: {
        ...visibility,
        [key]: value,
      },
    }),
  }
)

export default enhance
