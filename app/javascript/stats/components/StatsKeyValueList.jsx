/** @jsx React.createElement */
/* @flow */

import React from 'react'

type Row = {
  label: string,
  value: string | number,
}

type Props = {
  baseClassName: string,
  rows: Row[],
  className?: string,
  header?: React$Node,
}

export function StatsKeyValueList ({
  baseClassName,
  rows,
  className,
  header,
}: Props): React$Node {
  const containerClassName = className || `${baseClassName}__content`
  return (
    <div className={containerClassName}>
      {header}
      {rows.map((row, index) => (
        <div className={`${baseClassName}__row`} key={index}>
          <span className={`${baseClassName}__label`}>{row.label}</span>
          <span className={`${baseClassName}__value`}>{row.value}</span>
        </div>
      ))}
    </div>
  )
}

export default StatsKeyValueList
