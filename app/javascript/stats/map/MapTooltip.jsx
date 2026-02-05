/* @flow */
import * as React from 'react'

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
  intl: any,
  tooltipRef: { current: HTMLDivElement | null },
}

/**
 * Tooltip displayed when hovering over a country on the map
 */
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
      : '#f9fafb'

  return (
    <div
      ref={tooltipRef}
      style={{
        position: 'absolute',
        left: position.left,
        top: position.top,
        background: 'rgba(0, 0, 0, 0.9)',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '6px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        fontSize: '12px',
        fontFamily: 'monospace',
        pointerEvents: 'none',
        whiteSpace: 'nowrap',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          fontWeight: 'bold',
          marginBottom: '4px',
          fontSize: '13px',
        }}
      >
        {country.name}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <div
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: binColor,
            border: '1px solid rgba(255,255,255,0.3)',
            flexShrink: 0,
          }}
        />
        <div>
          <div style={{ fontWeight: '500' }}>
            {country.unique_visits.toLocaleString()}{' '}
            {intl.formatMessage({
              id: 'cases.stats.show.mapTooltipVisitors',
            })}
          </div>
          <div style={{ fontSize: '11px', opacity: 0.8 }}>
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
