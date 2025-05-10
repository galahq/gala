/**
 * @providesModule SuggestedQuizzes
 * @flow
 */

import * as React from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'
import { Switch, Route } from 'react-router-dom'
import { Dialog } from '@blueprintjs/core'
import { FormattedMessage } from 'react-intl'

import AllQuizzes from 'suggested_quizzes/AllQuizzes'
import QuizDetails from 'suggested_quizzes/QuizDetails'
import CaseOverview from 'overview/CaseOverview'

import { newSuggestedQuiz } from 'redux/actions'

import type { ContextRouter } from 'react-router-dom'

type Props = ContextRouter & {
  newSuggestedQuiz: typeof newSuggestedQuiz,
}
function SuggestedQuizzes ({ newSuggestedQuiz, history, match }: Props) {
  return (
    <Container>
      <Route component={CaseOverview} />
      <Dialog
        isOpen={!!match}
        className="pt-dark"
        title={<FormattedMessage id="cases.edit.suggestedQuizzes.title" />}
        style={{ top: '10%', width: '100%', maxWidth: 800 }}
        onClose={e => {
          history.replace('/')
        }}
      >
        <Switch>
          <Route
            path="/suggested_quizzes/:quizId"
            render={({
              match: {
                params: { quizId },
              },
              history,
            }) => <QuizDetails id={quizId || ''} history={history} />}
          />

          <Route
            path="/suggested_quizzes"
            render={({ history }) => (
              <AllQuizzes
                onCreateQuiz={() => {
                  newSuggestedQuiz({ param: "new", questions: [], title: "New Quiz" }).then(quizId => {
                    history.push(`/suggested_quizzes/${quizId}`)
                  })
                }}
              />
            )}
          />
        </Switch>
      </Dialog>
    </Container>
  )
}

export default connect(
  null,
  { newSuggestedQuiz }
)(SuggestedQuizzes)

const Container = styled.div`
  height: 100%;
`
