/**
 * @providesModule OptionCustomizer
 * @flow
 */

import * as React from 'react'
import styled from 'styled-components'
import { Button, Intent, InputGroup, Radio } from '@blueprintjs/core'
import { hotkeyDispatch } from 'shared/keyboard'

type Props = {
  option: string,
  checked: boolean,
  onAdd: () => void,
  onChange: string => void,
  onCheck: () => void,
  onRemove: () => void,
}

function OptionCustomizer (
  { option, checked, onAdd, onChange, onCheck, onRemove }: Props,
  ref
) {
  return (
    <div className="bp3-control-group bp3-fill">
      <GroupedRadio
        value={option}
        checked={checked}
        className="bp3-fixed"
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
            className="bp3-minimal"
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
export default React.forwardRef(OptionCustomizer)

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

  & > .bp3-control-indicator {
    margin: 7px;
  }
`
