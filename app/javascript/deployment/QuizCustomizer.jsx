/**
 * @providesModule QuizCustomizer
 * @flow
 */

import React from 'react'
import styled from 'styled-components'
import { append, update, remove } from 'ramda'

import { Button, Intent, InputGroup, Radio } from '@blueprintjs/core'

import type { Question } from './types'

import { hotkeyDispatch } from 'shared/keyboard'

type Props = {
  customQuestions: Question[],
  onChange: (Question[]) => void,
}
const QuizCustomizer = ({ customQuestions, onChange }: Props) => {
  const handleAddQuestion = () =>
    onChange(
      append(
        {
          id: null,
          content: '',
          options: [],
          correctAnswer: '',
          hasError: false,
        },
        customQuestions
      )
    )

  const handleRemoveQuestion = (i: number) =>
    onChange(remove(i, 1, customQuestions))

  const handleEditQuestionContent = (i: number, content: string) =>
    onChange(update(i, { ...customQuestions[i], content }, customQuestions))

  const handleEditQuestionOptions = (i: number, options: string[]) =>
    onChange(update(i, { ...customQuestions[i], options }, customQuestions))

  const handleAddQuestionOption = (i: number) =>
    handleEditQuestionOptions(i, append('', customQuestions[i].options))

  const handleRemoveQuestionOption = (questionIx: number, optionIx: number) =>
    handleEditQuestionOptions(
      questionIx,
      remove(optionIx, 1, customQuestions[questionIx].options)
    )

  const handleEditQuestionOption = (
    questionIx: number,
    optionIx: number,
    content: string
  ) =>
    handleEditQuestionOptions(
      questionIx,
      update(optionIx, content, customQuestions[questionIx].options)
    )

  const handleEditQuestionAnswer = (i: number, correctAnswer: string) =>
    onChange(
      update(
        i,
        { ...customQuestions[i], hasError: false, correctAnswer },
        customQuestions
      )
    )

  return (
    <div>
      {customQuestions.map((question: Question, questionIx: number) => {
        const { content, options, correctAnswer } = question
        return (
          <PaddedItem key={questionIx}>
            <QuestionInputGroup
              autoFocus
              intent={question.hasError ? Intent.WARNING : null}
              value={content}
              placeholder="Question text"
              type="text"
              leftIcon={options.length > 0 ? 'properties' : 'comment'}
              rightElement={
                content ? (
                  <Button
                    className="pt-minimal"
                    icon="add"
                    onClick={_ => handleAddQuestionOption(questionIx)}
                  >
                    Add option
                  </Button>
                ) : (
                  <Button
                    className="pt-minimal"
                    icon="delete"
                    onClick={_ => handleRemoveQuestion(questionIx)}
                  >
                    Delete question
                  </Button>
                )
              }
              onKeyDown={hotkeyDispatch({
                Enter: () => {
                  if (content) handleAddQuestionOption(questionIx)
                },
              })}
              onChange={(e: SyntheticInputEvent<*>) =>
                handleEditQuestionContent(questionIx, e.target.value)
              }
            />

            {options.length > 0 ? (
              options.map((option: string, optionIx: number) => (
                <div className="pt-control-group pt-fill" key={optionIx}>
                  <GroupedRadio
                    value={option}
                    checked={option !== '' && option === correctAnswer}
                    className="pt-fixed"
                    onChange={(e: SyntheticInputEvent<*>) => {
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
                        icon="delete"
                        onClick={_ =>
                          handleRemoveQuestionOption(questionIx, optionIx)
                        }
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
                    onChange={(e: SyntheticInputEvent<*>) =>
                      handleEditQuestionOption(
                        questionIx,
                        optionIx,
                        e.target.value
                      )
                    }
                  />
                </div>
              ))
            ) : (
              <RubricTextArea
                value={correctAnswer}
                onChange={e =>
                  handleEditQuestionAnswer(questionIx, e.currentTarget.value)
                }
              />
            )}
          </PaddedItem>
        )
      })}
      <FlushButton
        alone={customQuestions.length === 0}
        icon="add"
        onClick={handleAddQuestion}
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
  box-shadow: inset 0 0 0 1px rgba(16, 22, 26, 0.3),
    inset 0 1px 1px rgba(16, 22, 26, 0.4);
  background: rgba(35, 53, 67);
  color: #ebeae4;
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

const RubricTextArea = styled.textarea.attrs({
  className: 'pt-input pt-fill',
  placeholder:
    'Enter a sample answer, or click “Add option” to make this question multiple choice...',
})`
  opacity: ${({ value }) => (value == null || value === '' ? 0.5 : 1)};
`
