/**
 * @providesModule forums
 * 
 */


export default function forums (
  state = [],
  action
) {
  switch (action.type) {
    case 'SET_FORUMS':
      return action.forums

    default:
      return state
  }
}
