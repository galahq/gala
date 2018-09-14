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
  icons: string[],
  value: string,
  onChange: string => mixed,
}

export const IconChooser = ({
  icons,
  value,
  onChange,
  ...props
}: IconChooserProps) => (
  <Select
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
