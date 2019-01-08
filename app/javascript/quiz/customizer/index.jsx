/**
 * @providesModule QuizCustomizer
 * @flow
 */

import React from 'react'
import styled from 'styled-components'
import { useArray, useControllableFocus } from 'utility/hooks'

import { Button } from '@blueprintjs/core'
import QuestionCustomizer from './QuestionCustomizer'

import type { DraftQuestion } from 'deployment/types'

type Props = {
  customQuestions: DraftQuestion[],
  onChange: (DraftQuestion[]) => void,
}

function QuizCustomizer ({ customQuestions, onChange }: Props) {
  const [
    questions,
    onAppendQuestion,
    onUpdateQuestion,
    onRemoveQuestion,
  ] = useArray<DraftQuestion>({
    array: customQuestions,
    setArray: onChange,
    defaultElement: {
      id: null,
      content: '',
      options: [],
      correctAnswer: '',
      hasError: false,
    },
  })

  const [questionRef, focusLastQuestion] = useControllableFocus()
  const [addQuestionButtonRef, focusAddQuestionButton] = useControllableFocus()

  function handleAppendQuestion () {
    onAppendQuestion()
    focusLastQuestion()
  }

  function handleRemoveQuestion (i) {
    if (i === questions.length - 1) focusLastQuestion()
    if (questions.length === 1) focusAddQuestionButton()
    onRemoveQuestion(i)
  }

  return (
    <div>
      {questions.map((question: DraftQuestion, i: number) => (
        <QuestionCustomizer
          key={i}
          ref={questionRef}
          question={question}
          onUpdate={value => onUpdateQuestion(i, value)}
          onRemove={() => handleRemoveQuestion(i)}
        />
      ))}

      <FlushButton
        elementRef={addQuestionButtonRef}
        alone={customQuestions.length === 0}
        icon="add"
        onClick={handleAppendQuestion}
      >
        Add question
      </FlushButton>
    </div>
  )
}

export default QuizCustomizer

const FlushButton = styled(Button)`
  margin-top: ${({ alone }: { alone: boolean }) => (alone ? '0.5em' : '0')};
  margin-left: -17px;
`
