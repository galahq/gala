/**
 * @flow
 */

import * as React from 'react'
import { FormattedMessage } from 'react-intl'
import { intersperse } from 'ramda'

type Props = {
  list: React.Node[],
  truncate?: { after: number, with: React.Node },
}
export function FormattedList({ list, truncate }: Props): React.Node {
  if (truncate != null && list.length > truncate.after) {
    const firstN = list.slice(0, truncate.after)
    return (
      <span>
        {intersperse(<FormattedMessage id="helpers.list.middle" />, firstN)}
        <FormattedMessage id="helpers.list.middle" />
        {truncate.with}
      </span>
    )
  }

  switch (list.length) {
    case 0:
      return <span />

    case 1:
      return <span>{list[0]}</span>

    case 2:
      return (
        <span>
          {list[0]}
          <FormattedMessage id="helpers.list.two" />
          {list[1]}
        </span>
      )

    default: {
      const start = list[0]
      const middle = list.slice(1, -1)
      const end = list[list.length - 1]
      return (
        <span>
          {start}
          <FormattedMessage id="helpers.list.start" />
          {intersperse(<FormattedMessage id="helpers.list.middle" />, middle)}
          <FormattedMessage id="helpers.list.end" />
          {end}
        </span>
      )
    }
  }
}
