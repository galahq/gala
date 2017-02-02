import { combineReducers } from 'redux'

function cards(state = window.caseData.statistics.cards, action) {
  return state
}
export default combineReducers({
  cards,
})
