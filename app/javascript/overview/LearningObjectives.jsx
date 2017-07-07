/**
 * @providesModule LearningObjectives
 * @flow
 */

import React from 'react'
import styled from 'styled-components'
import { FormattedMessage } from 'react-intl'

type Props = {
  learningObjectives: string[],
  onChange: (string[]) => any,
}
const LearningObjectives = ({ learningObjectives, onChange }: Props) =>
  <div>
    <Label>
      <FormattedMessage id="overview.learningObjectives" />
    </Label>
    <ul>
      {learningObjectives.map((objective, i) =>
        <li key={i}>
          {objective}
        </li>
      )}
    </ul>
  </div>

export default LearningObjectives

const Label = styled.h3`
  font-family: 'tenso';
  font-size: 1em;
  font-weight: 500;
`
