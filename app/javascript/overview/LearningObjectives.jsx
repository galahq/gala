/**
 * @providesModule LearningObjectives
 * @flow
 */

import React from 'react'
import styled from 'styled-components'
import debounce from 'lodash.debounce'
import { isBlank } from 'shared/functions'
import { FormattedMessage } from 'react-intl'

import SortableList, { createSortableInput } from 'utility/SortableList'

type Props = {
  editing: boolean,
  learningObjectives: string[],
  onChange: (string[]) => any,
  onStopChanging: () => any,
}
class LearningObjectives extends React.Component<Props> {
  onStopChanging = debounce(this.props.onStopChanging, 200)
  render () {
    const { editing, learningObjectives, onChange } = this.props
    if (!editing && isBlank(learningObjectives)) return null

    return (
      <div>
        <Label>
          <FormattedMessage id="activerecord.attributes.case.learningObjectives" />
        </Label>
        {!editing ? (
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

const ObjectiveInput = createSortableInput({ placeholder: 'Objective', 'aria-label': 'Input learning objectives' })
