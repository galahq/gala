/**
 * @providesModule QuestionCustomizer
 * @flow
 */

import * as React from 'react'
import styled from 'styled-components'
import { hotkeyDispatch } from 'shared/keyboard'
import { useArray, useControllableFocus } from 'utility/hooks'

import { Button, Intent, InputGroup } from '@blueprintjs/core'
import OptionCustomizer from './OptionCustomizer'

import type { DraftQuestion } from 'deployment/types'

type Props = {
  question: DraftQuestion,
  onUpdate: DraftQuestion => void,
  onRemove: () => void,
}

function QuestionCustomizer (
  { question, onUpdate, onRemove }: Props,
  componentRef
) {
  const { content, correctAnswer, hasError } = question

  function handleEditAnswer (correctAnswer: string) {
    onUpdate({ ...question, hasError: false, correctAnswer })
  }

  const [options, onAppendOption, onUpdateOption, onRemoveOption] = useArray({
    array: question.options,
    setArray: (options: string[]) => onUpdate({ ...question, options }),
    defaultElement: '',
  })

  const [questionRef, focusQuestion] = useControllableFocus()
  const [optionRef, focusLastOption] = useControllableFocus()

  function handleAppendOption () {
    onAppendOption()
    focusLastOption()
  }

  function handleRemoveOption (i) {
    if (i === options.length - 1) focusLastOption()
    if (options.length === 1) focusQuestion()
    onRemoveOption(i)
  }

  return (
    <PaddedItem>
      <QuestionInputGroup
        inputRef={value => {
          questionRef(value)
          componentRef(value)
        }}
        value={content}
        placeholder="Question text"
        type="text"
        intent={hasError ? Intent.DANGER : null}
        leftIcon={options.length > 0 ? 'properties' : 'comment'}
        rightElement={
          content ? (
            <Button
              className="bp3-minimal"
              icon="add"
              onClick={handleAppendOption}
            >
              Add option
            </Button>
          ) : (
            <Button className="bp3-minimal" icon="delete" onClick={onRemove}>
              Delete question
            </Button>
          )
        }
        onKeyDown={hotkeyDispatch({
          Enter: () => {
            if (content) handleAppendOption()
          },
          Backspace: () => {
            if (
              content === '' &&
              options.length === 0 &&
              correctAnswer === ''
            ) {
              onRemove()
            } else {
              return true
            }
          },
        })}
        onChange={(e: SyntheticInputEvent<*>) =>
          onUpdate({ ...question, content: e.target.value })
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
export default React.forwardRef(QuestionCustomizer)

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

const RubricTextArea = styled.textarea.attrs({
  className: 'bp3-input bp3-fill',
  placeholder:
    'Enter a sample answer, or click “Add option” to make this question multiple choice...',
})`
  opacity: ${({ value }) => (value == null || value === '' ? 0.5 : 1)};
`
