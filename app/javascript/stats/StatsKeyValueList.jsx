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

function StatsKeyValueList ({
  baseClassName,
  rows,
  className,
  header,
}: Props): React$Node {
  const containerClass = className || `${baseClassName}__content`

  return (
    <div className={containerClass}>
      {header}
      {rows.map((row, index) => (
        <div className={`${baseClassName}__row`} key={`${row.label}-${index}`}>
          <span className={`${baseClassName}__label`}>{row.label}</span>
          <span className={`${baseClassName}__value`}>{row.value}</span>
        </div>
      ))}
    </div>
  )
}

export default StatsKeyValueList
