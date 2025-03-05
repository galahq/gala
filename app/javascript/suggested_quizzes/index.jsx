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

import { createSuggestedQuiz } from 'redux/actions'

import type { ContextRouter } from 'react-router-dom'

type Props = ContextRouter & {
  createSuggestedQuiz: typeof createSuggestedQuiz,
}
function SuggestedQuizzes ({ createSuggestedQuiz, history, match }: Props) {
  return (
    <Container>
      <Route component={CaseOverview} />
      <Dialog
        isOpen={!!match}
        className="bp3-dark"
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
                onCreateQuiz={() =>
                  createSuggestedQuiz().then(id =>
                    history.push(`/suggested_quizzes/${id}`)
                  )
                }
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
  { createSuggestedQuiz }
)(SuggestedQuizzes)

const Container = styled.div`
  height: 100%;
`
