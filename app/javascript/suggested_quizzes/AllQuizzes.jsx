/**
 * @providesModule AllQuizzes
 * @flow
 */

import React from 'react'
import styled from 'styled-components'
import { FormattedMessage } from 'react-intl'
import { Button, Intent, NonIdealState } from '@blueprintjs/core'

import { Title } from 'suggested_quizzes/styled'

type Props = { onCreateQuiz: () => any }

export default function AllQuizzes ({ onCreateQuiz }: Props) {
  return (
    <>
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
            <Button intent={Intent.SUCCESS} icon="add" onClick={onCreateQuiz}>
              <FormattedMessage id="quizzes.new.newQuiz" />
            </Button>
          }
        />
      </Card>
    </>
  )
}

const Card = styled.div.attrs({ className: 'pt-card' })`
  background-color: #ebeae4;
  max-width: 45em;
`
