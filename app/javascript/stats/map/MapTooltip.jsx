/* @flow */
import * as React from 'react'

import { Colors } from '../colors'

type CountryData = {
  iso2: string,
  iso3: string,
  name: string,
  unique_visits: number,
  bin: number,
}

type Props = {
  country: CountryData,
  position: { left: number, top: number },
  binColors: string[],
  intl: any,
  tooltipRef: { current: HTMLDivElement | null },
}

function MapTooltip ({
  country,
  position,
  binColors,
  intl,
  tooltipRef,
}: Props): React.Node {
  const binColor =
    binColors.length > 0
      ? binColors[Math.min(country.bin || 0, binColors.length - 1)] ||
        binColors[0]
      : Colors.GRAY1

  return (
    <div
      ref={tooltipRef}
      className="c-stats-map-tooltip"
      style={{ left: position.left, top: position.top }}
    >
      <div className="c-stats-map-tooltip__country">
        {country.name}
      </div>
      <div className="c-stats-map-tooltip__content">
        <span className="c-stats-map-tooltip__color" style={{ backgroundColor: binColor }} />
        <div className="c-stats-map-tooltip__visitors">
          {country.unique_visits.toLocaleString()}{' '}
          {intl.formatMessage({
            id: 'cases.stats.show.mapTooltipVisitors',
          })}
        </div>
      </div>
    </div>
  )
}

export default React.memo<Props>(MapTooltip)
