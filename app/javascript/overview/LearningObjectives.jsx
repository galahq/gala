/**
 * @providesModule LearningObjectives
 * @flow
 */

import React from 'react'
import styled from 'styled-components'

import debounce from 'lodash.debounce'
import { FormattedMessage } from 'react-intl'

import SortableList, { createSortableInput } from 'utility/SortableList'

type Props = {
  disabled: boolean,
  learningObjectives: string[],
  onChange: (string[]) => any,
  onStopChanging: () => any,
}
class LearningObjectives extends React.Component<Props> {
  onStopChanging = debounce(this.props.onStopChanging, 200)
  render () {
    const { disabled, learningObjectives, onChange } = this.props
    return (
      <div>
        <Label>
          <FormattedMessage id="activerecord.attributes.case.learningObjectives" />
        </Label>
        {disabled ? (
          <ul>
            {learningObjectives.map((objective, i) => (
              <li key={i}>{objective}</li>
            ))}
          </ul>
        ) : (
          <SortableList
            items={learningObjectives || []}
            newItem={''}
            render={ObjectiveInput}
            onChange={(...args) => {
              onChange(...args)
              this.onStopChanging()
            }}
          />
        )}
      </div>
    )
  }
}

export default LearningObjectives

const Label = styled.h3`
  font-family: ${p => p.theme.sansFont};
  font-size: 0.95em;
  font-weight: 500;
`

const ObjectiveInput = createSortableInput({ placeholder: 'Objective' })
