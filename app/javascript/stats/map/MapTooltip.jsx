/* @flow */
import * as React from 'react'

import { Colors } from '../colors'

type CountryData = {
  iso2?: ?string,
  iso3?: ?string,
  name?: ?string,
  unique_visits: number,
  bin: number,
}

type Props = {
  country: CountryData,
  position: { left: number, top: number },
  binColors: string[],
  binTextColors: string[],
  intl: any,
  tooltipRef: { current: HTMLDivElement | null },
}

function normalizeIso2 (value: mixed): ?string {
  if (typeof value !== 'string') return null
  const normalized = value.trim().toUpperCase()
  return normalized.length === 2 ? normalized : null
}

function buildFlagUrl (iso2: ?string): ?string {
  if (!iso2) return null
  return `https://flagcdn.com/${iso2.toLowerCase()}.svg`
}

function MapTooltip ({
  country,
  position,
  binColors,
  binTextColors,
  intl,
  tooltipRef,
}: Props): React.Node {
  const colorIndex =
    binColors.length > 0
      ? Math.min(country.bin || 0, binColors.length - 1)
      : -1

  const binColor =
    colorIndex >= 0
      ? binColors[colorIndex] || binColors[0]
      : Colors.GRAY1
  const binTextColor =
    colorIndex >= 0
      ? binTextColors[colorIndex] || Colors.WHITE
      : Colors.WHITE

  const countryName = country.name || 'Unknown'
  const flagUrl = buildFlagUrl(normalizeIso2(country.iso2))

  return (
    <div
      ref={tooltipRef}
      className="c-stats-map-tooltip"
      style={{ left: position.left, top: position.top }}
    >
      <div className="c-stats-map-tooltip__country-row">
        {flagUrl && (
          <img
            className="c-stats-map-tooltip__flag"
            src={flagUrl || undefined}
            width="20"
            height="14"
            loading="lazy"
            alt={`${countryName} flag`}
            onError={event => {
              event.currentTarget.style.display = 'none'
            }}
          />
        )}
        <div className="c-stats-map-tooltip__country">
          {countryName}
        </div>
      </div>
      <div className="c-stats-map-tooltip__content">
        <span className="c-stats-map-tooltip__label">
          {intl.formatMessage({ id: 'cases.stats.show.tableUniqueVisitors' })}
        </span>
        <span
          className="c-stats-map-tooltip__value"
          style={{ backgroundColor: binColor, color: binTextColor }}
        >
          {country.unique_visits.toLocaleString()}
        </span>
      </div>
    </div>
  )
}

export default React.memo<Props>(MapTooltip)
