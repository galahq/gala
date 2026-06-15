/**
 * Keep track of changes to link expansion visibility
 * @providesModule withVisibilityChanges
 *
 */

import { withStateHandlers } from 'recompose'



const enhance = withStateHandlers(
  { visibility: ({}) },
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
