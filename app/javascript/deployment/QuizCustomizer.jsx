/**
 * @providesModule QuizCustomizer
 * @flow
 */

import React from 'react'
import styled from 'styled-components'

import { Button, Intent, InputGroup, Radio } from '@blueprintjs/core'

import type { DraftQuestion } from './types'

import { hotkeyDispatch } from 'shared/keyboard'
import { useArray, useControllableFocus } from 'utility/hooks'

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
    onRemoveQuestion(i)
    if (i === questions.length - 1) focusLastQuestion()
    if (questions.length === 1) focusAddQuestionButton()
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

function QuestionCustomizer ({ question, onUpdate, onRemove }, componentRef) {
  const { content, correctAnswer, hasError } = question

  function handleEditContent (content: string) {
    onUpdate({ ...question, content })
  }

  function handleEditOptions (options: string[]) {
    onUpdate({ ...question, options })
  }

  function handleEditAnswer (correctAnswer: string) {
    onUpdate({ ...question, hasError: false, correctAnswer })
  }

  const [options, onAppendOption, onUpdateOption, onRemoveOption] = useArray({
    array: question.options,
    setArray: handleEditOptions,
    defaultElement: '',
  })

  const [questionRef, focusQuestion] = useControllableFocus()
  const [optionRef, focusLastOption] = useControllableFocus()

  function setQuestionRef (value) {
    questionRef(value)
    componentRef(value)
  }

  function handleAppendOption () {
    onAppendOption()
    focusLastOption()
  }

  function handleRemoveOption (i) {
    onRemoveOption(i)
    if (i === options.length - 1) focusLastOption()
    if (options.length === 1) focusQuestion()
  }

  return (
    <PaddedItem>
      <QuestionInputGroup
        inputRef={setQuestionRef}
        intent={hasError ? Intent.DANGER : null}
        value={content}
        placeholder="Question text"
        type="text"
        leftIcon={options.length > 0 ? 'properties' : 'comment'}
        rightElement={
          content ? (
            <Button
              className="pt-minimal"
              icon="add"
              onClick={handleAppendOption}
            >
              Add option
            </Button>
          ) : (
            <Button className="pt-minimal" icon="delete" onClick={onRemove}>
              Delete question
            </Button>
          )
        }
        onKeyDown={hotkeyDispatch({
          Enter: () => {
            if (content) handleAppendOption()
          },
          Backspace: () => {
            if (content === '') {
              onRemove()
            } else {
              return true
            }
          },
        })}
        onChange={(e: SyntheticInputEvent<*>) =>
          handleEditContent(e.target.value)
        }
      />

      {options.length > 0 ? (
        options.map((option: string, i: number) => (
          <OptionCustomizer
            key={i}
            ref={optionRef}
            option={option}
            checked={option !== '' && option === correctAnswer}
            onAdd={handleAppendOption}
            onChange={value => onUpdateOption(i, value)}
            onCheck={() => handleEditAnswer(option)}
            onRemove={() => handleRemoveOption(i)}
          />
        ))
      ) : (
        <RubricTextArea
          value={correctAnswer}
          onChange={e => handleEditAnswer(e.currentTarget.value)}
        />
      )}
    </PaddedItem>
  )
}

// $FlowFixMe
QuestionCustomizer = React.forwardRef(QuestionCustomizer) // eslint-disable-line no-func-assign

function OptionCustomizer (
  { option, checked, onAdd, onChange, onCheck, onRemove },
  ref
) {
  return (
    <div className="pt-control-group pt-fill">
      <GroupedRadio
        value={option}
        checked={checked}
        className="pt-fixed"
        onChange={(e: SyntheticInputEvent<*>) => {
          if (e.target.checked) onCheck()
        }}
      />

      <InputGroup
        inputRef={ref}
        value={option}
        placeholder="Option text"
        type="text"
        rightElement={
          <Button
            intent={Intent.DANGER}
            className="pt-minimal"
            icon="delete"
            onClick={onRemove}
          />
        }
        onKeyDown={hotkeyDispatch({
          Enter: () => {
            if (option) onAdd()
          },
          Backspace: () => {
            if (option === '') {
              onRemove()
            } else {
              return true
            }
          },
        })}
        onChange={(e: SyntheticInputEvent<*>) => onChange(e.target.value)}
      />
    </div>
  )
}

// $FlowFixMe
OptionCustomizer = React.forwardRef(OptionCustomizer) // eslint-disable-line no-func-assign

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
