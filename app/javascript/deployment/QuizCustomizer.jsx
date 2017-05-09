/**
 * @providesModule QuizCustomizer
 * @flow
 */

import React from 'react'
import styled from 'styled-components'
import { List } from 'immutable'

import { Button, Intent, InputGroup, Radio } from '@blueprintjs/core'

import { Question } from './types'

import { hotkeyDispatch } from 'shared/keyboard'

type Props = {
  customQuestions: List<Question>,
  onChange: List<Question> => void,
}
const QuizCustomizer = ({ customQuestions, onChange }: Props) => {
  const handleAddQuestion = () => onChange(customQuestions.push(new Question()))

  const handleRemoveQuestion = (i: number) =>
    onChange(customQuestions.delete(i))

  const handleEditQuestionContent = (i: number, content: string) =>
    onChange(
      customQuestions.set(i, customQuestions.get(i).set('content', content))
    )

  const handleEditQuestionOptions = (i: number, options: List<string>) =>
    onChange(
      customQuestions.set(i, customQuestions.get(i).set('options', options))
    )

  const handleAddQuestionOption = (i: number) =>
    handleEditQuestionOptions(i, customQuestions.get(i).getOptions().push(''))

  const handleRemoveQuestionOption = (questionIx: number, optionIx: number) =>
    handleEditQuestionOptions(
      questionIx,
      customQuestions.get(questionIx).getOptions().delete(optionIx)
    )

  const handleEditQuestionOption = (
    questionIx: number,
    optionIx: number,
    content: string
  ) =>
    handleEditQuestionOptions(
      questionIx,
      customQuestions.get(questionIx).getOptions().set(optionIx, content)
    )

  const handleEditQuestionAnswer = (questionIx: number, answer: string) =>
    onChange(
      customQuestions.set(
        questionIx,
        customQuestions
          .get(questionIx)
          .set('answer', answer)
          .set('hasError', false)
      )
    )

  return (
    <div>
      {customQuestions.map((question: Question, questionIx: number) => {
        const content: string = question.getContent()
        const options: List<string> = question.getOptions()
        const answer: string = question.getAnswer()
        return (
          <PaddedItem key={questionIx}>

            <QuestionInputGroup
              autoFocus
              intent={question.hasError() && Intent.WARNING}
              value={content}
              placeholder="Question text"
              type="text"
              leftIconName={options.size > 0 ? 'properties' : 'comment'}
              rightElement={
                content
                  ? <Button
                    className="pt-minimal"
                    iconName="add"
                    onClick={() => handleAddQuestionOption(questionIx)}
                  >
                      Add option
                    </Button>
                  : <Button
                    className="pt-minimal"
                    iconName="delete"
                    onClick={() => handleRemoveQuestion(questionIx)}
                  >
                      Delete question
                    </Button>
              }
              onKeyDown={hotkeyDispatch({
                Enter: () => {
                  if (content) handleAddQuestionOption(questionIx)
                },
              })}
              onChange={(e: SyntheticInputEvent) =>
                handleEditQuestionContent(questionIx, e.target.value)}
            />

            {options.map((option: string, optionIx: number) => (
              <div className="pt-control-group pt-fill" key={optionIx}>
                <GroupedRadio
                  value={option}
                  checked={option !== '' && option === answer}
                  className="pt-fixed"
                  onChange={(e: SyntheticInputEvent) => {
                    if (e.target.checked) {
                      handleEditQuestionAnswer(questionIx, option)
                    }
                  }}
                />
                <InputGroup
                  autoFocus
                  value={option}
                  placeholder="Option text"
                  type="text"
                  rightElement={
                    <Button
                      intent={Intent.DANGER}
                      className="pt-minimal"
                      iconName="delete"
                      onClick={() =>
                        handleRemoveQuestionOption(questionIx, optionIx)}
                    />
                  }
                  onKeyDown={hotkeyDispatch({
                    Enter: () => {
                      if (option) handleAddQuestionOption(questionIx)
                    },
                    Backspace: () => {
                      if (option === '') {
                        handleRemoveQuestionOption(questionIx, optionIx)
                      } else {
                        return true
                      }
                    },
                  })}
                  onChange={(e: SyntheticInputEvent) =>
                    handleEditQuestionOption(
                      questionIx,
                      optionIx,
                      e.target.value
                    )}
                />
              </div>
            ))}

          </PaddedItem>
        )
      })}
      <FlushButton
        alone={customQuestions.size === 0}
        iconName="add"
        onClick={handleAddQuestion}
      >
        Add question
      </FlushButton>
    </div>
  )
}

export default QuizCustomizer

const FlushButton = styled(Button)`
  margin-top: ${({ alone }) => (alone ? '0.5em' : '0')};
  margin-left: -17px;
`

const QuestionInputGroup = styled(InputGroup)`
  & > input {
    background: rgba(16, 22, 26, 0.6) !important;
  }
`

const PaddedItem = styled.li`
  margin: 0.5em 0 1em;

  & > * {
    margin-bottom: 0.25em;
  }
`

const GroupedRadio = styled(Radio)`
  outline: none;
  border: none;
  border-radius: 3px;
  box-shadow: inset 0 0 0 1px rgba(16, 22, 26, 0.3), inset 0 1px 1px rgba(16, 22, 26, 0.4);
  background: rgba(35, 53, 67);
  color: #EBEAE4;
  height: 30px;
  padding: 15px;
  margin: 0;
  vertical-align: middle;
  line-height: 30px;
  font-size: 14px;
  font-weight: 400;
  transition: box-shadow 100ms cubic-bezier(0.4, 1, 0.75, 0.9);

  & > .pt-control-indicator {
    margin: 7px;
  }
`
