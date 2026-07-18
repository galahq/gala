/**
 * @providesModule OptionCustomizer
 *
 */

import * as React from 'react'
import styled from 'styled-components'
import { Button, Intent, InputGroup, Radio } from '@blueprintjs/core'
import { hotkeyDispatch } from 'shared/keyboard'


function OptionCustomizer (
  { option, checked, onAdd, onChange, onCheck, onRemove },
  ref
) {
  return (
    <div className="bp6-control-group bp6-fill">
      <GroupedRadio
        value={option}
        checked={checked}
        className="bp6-fixed"
        onChange={(e) => {
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
            className="bp6-minimal"
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
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

export default React.forwardRef(OptionCustomizer)

const GroupedRadio = styled(Radio)`
  /* Fixed square segment (matches the 30px input height) that centers the radio
     dot. BP6 changed the control indicator to position: relative / inline-block
     (it was absolutely positioned in BP2), so the old padding + indicator-margin
     hack dropped the dot down-and-left instead of centering it. */
  position: relative;
  flex: none;
  box-sizing: border-box;
  width: 30px;
  height: 30px;
  margin: 0;
  padding: 0;
  outline: none;
  border: none;
  border-radius: 3px;
  box-shadow: inset 0 0 0 1px rgba(16, 22, 26, 0.3),
    inset 0 1px 1px rgba(16, 22, 26, 0.4);
  background: rgba(35, 53, 67);
  color: #ebeae4;
  transition: box-shadow 100ms cubic-bezier(0.4, 1, 0.75, 0.9);

  /* Absolutely center the dot in the square — robust against BP6's hidden input
     and any whitespace nodes that otherwise pollute flex/inline centering. The
     triple-& outranks BP6's \`.bp6-control.bp6-radio .bp6-control-indicator\`. */
  &&& > .bp6-control-indicator {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    margin: 0;
  }
`
