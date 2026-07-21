/**
 * @providesModule quiz
 * 
 */



const getInitialQuizState = () =>
  (window.caseData.quiz) || {
    needsPretest: false,
    needsPosttest: false,
    questions: [],
  }


export default function quiz (
  state = getInitialQuizState(),
  action
) {
  switch (action.type) {
    case 'RECORD_QUIZ_SUBMISSION':
      return {
        ...state,
        ...action.data,
      }

    default:
      return state
  }
}
