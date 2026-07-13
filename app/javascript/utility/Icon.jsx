/**
 * @providesModule Icon
 * 
 */

import React from 'react'
import { Button, MenuItem } from '@blueprintjs/core'
import { Select } from '@blueprintjs/select'
import { FormattedMessage } from 'react-intl'

const Icon = ({ filename, ...props }) => (
  <span
    dangerouslySetInnerHTML={{
      __html: require(`images/${filename}.svg`),
    }}
    {...props}
  />
)

export default Icon


export const IconChooser = ({
  icons,
  value,
  onChange,
  disabled,
  ...props
}) => (
  <Select
    disabled={disabled}
    filterable={false}
    items={icons}
    itemRenderer={(item, { handleClick, modifiers: { active, disabled } }) => (
      <MenuItem
        active={active}
        disabled={disabled}
        key={item}
        icon={<Icon filename={item} />}
        text={translated(item)}
        onClick={handleClick}
      />
    )}
    popoverProps={{ minimal: true }}
    onItemSelect={onChange}
  >
    <Button
      disabled={disabled}
      icon={<Icon filename={value} />}
      style={{ flex: 1 }}
      rightIcon="double-caret-vertical"
      text={
        value ? (
          translated(value)
        ) : (
          <FormattedMessage id="activities.activity.chooseIcon" />
        )
      }
    />
  </Select>
)

const translated = (iconName) => (
  <FormattedMessage id={`icons.${iconName.replace('-', '.')}`} />
)
