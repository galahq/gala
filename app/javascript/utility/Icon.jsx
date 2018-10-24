/**
 * @providesModule Icon
 * @flow
 */

import React from 'react'
import { Button, MenuItem } from '@blueprintjs/core'
import { Select } from '@blueprintjs/select'
import { FormattedMessage } from 'react-intl'

type Props = { filename: string }
const Icon = ({ filename, ...props }: Props) => (
  <span
    dangerouslySetInnerHTML={{
      __html: require(`images/${filename}.svg`),
    }}
    {...props}
  />
)

export default Icon

type IconChooserProps = {
  disabled?: boolean,
  icons: string[],
  value: string,
  onChange: string => mixed,
}

export const IconChooser = ({
  icons,
  value,
  onChange,
  disabled,
  ...props
}: IconChooserProps) => (
  <Select
    disabled={disabled}
    filterable={false}
    inputProps={{ value, onChange }}
    items={icons}
    itemRenderer={(item, { handleClick, modifiers }) => (
      <MenuItem
        {...modifiers}
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

const translated = (iconName: string) => (
  <FormattedMessage id={`icons.${iconName.replace('-', '.')}`} />
)
