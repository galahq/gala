/**
 * @providesModule SuggestedQuizzes
 * @flow
 */

import * as React from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'
import { Switch, Route } from 'react-router-dom'

import Sidebar from 'elements/Sidebar'
import AllQuizzes from 'suggested_quizzes/AllQuizzes'
import QuizDetails from 'suggested_quizzes/QuizDetails'

import { createSuggestedQuiz } from 'redux/actions'

type Props = {
  createSuggestedQuiz: typeof createSuggestedQuiz,
}
function SuggestedQuizzes ({ createSuggestedQuiz }: Props) {
  return (
    <Container>
      <Sidebar />
      <main>
        <Switch>
          <Route
            path="/suggested_quizzes/:quizId"
            render={({
              match: {
                params: { quizId },
              },
            }) => <QuizDetails id={quizId || ''} />}
          />

          <Route
            path="/suggested_quizzes"
            render={({ history }) => (
              <AllQuizzes
                onCreateQuiz={() =>
                  createSuggestedQuiz().then(id =>
                    history.push(`/suggested_quizzes/${id}`)
                  )
                }
              />
            )}
          />
        </Switch>
      </main>
    </Container>
  )
}

export default connect(
  null,
  { createSuggestedQuiz }
)(SuggestedQuizzes)

const Container = styled.div.attrs({ className: 'window' })``
