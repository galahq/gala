/**
 * @providesModule SuggestedQuizzes
 * @flow
 */

import * as React from 'react'
import styled from 'styled-components'
import { FormattedMessage } from 'react-intl'
import { Button, Intent, NonIdealState } from '@blueprintjs/core'

import Sidebar from 'elements/Sidebar'

export default function SuggestedQuizzes () {
  return (
    <Container>
      <Sidebar />
      <main>
        <Title>
          <FormattedMessage id="cases.edit.suggestedQuizzes.title" />
        </Title>

        <Card>
          <NonIdealState
            visual="properties"
            title={
              <FormattedMessage id="cases.edit.suggestedQuizzes.suggestAnAssessment" />
            }
            description={
              <FormattedMessage id="cases.edit.suggestedQuizzes.description" />
            }
            action={
              <Button intent={Intent.SUCCESS} icon="add">
                <FormattedMessage id="quizzes.new.newQuiz" />
              </Button>
            }
          />
        </Card>
      </main>
    </Container>
  )
}

const Container = styled.div.attrs({ className: 'window' })``

const Title = styled.h1`
  color: white;
  font-size: 1.3em;
  margin: 1em 0 0.75em;
`

const Card = styled.div.attrs({ className: 'pt-card' })`
  background-color: #ebeae4;
  max-width: 45em;
`
