/**
 * @providesModule Deployment
 * @flow
 */

import React from 'react'
import { Map, List } from 'immutable'

import QuizSelector from './QuizSelector'
import QuizDetails from './QuizDetails'
import Toolbar from './Toolbar'

import { Question } from './types'
import type { ID, Quiz } from './types'

type Props = {
  caseData: Object,
  group: {
    name: string,
  },
  recommendedQuizzes: { [id: ID]: Quiz },
}

type State = {
  selectedQuizId: ?ID,
  customQuestions: Map<ID, List<Question>>,
  answersNeeded: 1 | 2,
}

class Deployment extends React.Component {
  props: Props
  state: State = {
    selectedQuizId: null,
    customQuestions: Map(),
    answersNeeded: 2,
  }

  _needsPretest: () => boolean
  _needsPosttest: () => boolean

  handleSelectQuiz: (quizId: ?ID) => void
  handleTogglePretest: () => void

  _needsPretest () {
    return this.state.selectedQuizId != null && this.state.answersNeeded === 2
  }
  _needsPosttest () {
    return this.state.selectedQuizId != null
  }

  handleSelectQuiz (quizId: ?ID) {
    this.setState({ selectedQuizId: quizId })
  }

  handleTogglePretest () {
    this.setState((state: State) => ({
      ...state,
      answersNeeded: state.answersNeeded === 1 ? 2 : 1,
    }))
  }

  handleChangeCustomQuestions (quizId: ID, customQuestions: List<Question>) {
    this.setState((state: State) => ({
      ...state,
      customQuestions: state.customQuestions.set(quizId, customQuestions),
    }))
  }

  constructor (props: Props) {
    super(props)

    this._needsPretest = this._needsPretest.bind(this)
    this._needsPosttest = this._needsPosttest.bind(this)
    this.handleSelectQuiz = this.handleSelectQuiz.bind(this)
    this.handleTogglePretest = this.handleTogglePretest.bind(this)
  }

  render () {
    const { caseData, recommendedQuizzes } = this.props
    const { selectedQuizId, customQuestions } = this.state
    return (
      <div className="pt-dark" style={{ padding: '0 12px' }}>
        {selectedQuizId == null
          ? <QuizSelector
            recommendedQuizzes={recommendedQuizzes}
            onSelect={this.handleSelectQuiz}
          />
          : <QuizDetails
            quiz={recommendedQuizzes[selectedQuizId]}
            customQuestions={customQuestions.get(selectedQuizId)}
            onChangeCustomQuestions={(newCustomQuestions: List<Question>) =>
                this.handleChangeCustomQuestions(
                  selectedQuizId,
                  newCustomQuestions
                )}
          />}
        <Toolbar
          withPretest={this._needsPretest()}
          withPosttest={this._needsPosttest()}
          caseData={caseData}
          onTogglePretest={this.handleTogglePretest}
          onDeselect={() => this.handleSelectQuiz(null)}
        />
      </div>
    )
  }
}

export default Deployment
