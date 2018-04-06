/**
 * Keep track of changes to link expansion visibility
 * @providesModule withVisibilityChanges
 * @flow
 */

import { withStateHandlers } from 'recompose'

import type { HOC } from 'recompose'
import type { LinkExpansionVisibility } from 'redux/state'

export type VisibilityChangeProps = {|
  toggleVisibility: (key: $Keys<LinkExpansionVisibility>) => mixed,
  visibility: LinkExpansionVisibility,
|}

const enhance: HOC<*, VisibilityChangeProps> = withStateHandlers(
  { visibility: ({}: LinkExpansionVisibility) },
  {
    toggleVisibility: ({ visibility }) => key => ({
      visibility: {
        ...visibility,
        [key]: !visibility[key],
      },
    }),
  }
)

export default enhance
