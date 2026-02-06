/* @flow */
import * as React from 'react'

import { Colors } from '../colors'

type CountryData = {
  iso2: string,
  iso3: string,
  name: string,
  unique_visits: number,
  unique_users: number,
  events_count: number,
  bin: number,
}

type Props = {
  country: CountryData,
  position: { left: number, top: number },
  binColors: string[],
  color?: ?string,
  intl: any,
  tooltipRef: { current: HTMLDivElement | null },
}

function MapTooltip ({
  country,
  position,
  binColors,
  color,
  intl,
  tooltipRef,
}: Props): React.Node {
  const binColor = color || (
    binColors.length > 0
      ? binColors[Math.min(country.bin || 0, binColors.length - 1)] ||
        binColors[0]
      : Colors.GRAY1
  )

  return (
    <div
      ref={tooltipRef}
      className="c-stats-map-tooltip pt-typography"
      style={{ left: position.left, top: position.top }}
    >
      <div className="c-stats-map-tooltip__country">
        {country.name}
      </div>
      <div className="c-stats-map-tooltip__content">
        <span className="c-stats-map-tooltip__color" style={{ backgroundColor: binColor }} />
        <div>
          <div className="c-stats-map-tooltip__visitors">
            {country.unique_visits.toLocaleString()}{' '}
            {intl.formatMessage({
              id: 'cases.stats.show.mapTooltipVisitors',
            })}
          </div>
          <div className="c-stats-map-tooltip__details">
            {country.unique_users.toLocaleString()}{' '}
            {intl.formatMessage({ id: 'cases.stats.show.mapTooltipUsers' })} •{' '}
            {country.events_count.toLocaleString()}{' '}
            {intl.formatMessage({
              id: 'cases.stats.show.mapTooltipEvents',
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default React.memo<Props>(MapTooltip)
