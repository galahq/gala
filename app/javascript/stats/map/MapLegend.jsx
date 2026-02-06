/* @flow */
import * as React from 'react'
import { Popover, Position, Icon } from '@blueprintjs/core'
import { FormattedMessage } from 'react-intl'

type Bin = {
  bin: number,
  min: number,
  max: number,
  label: string,
}

type Props = {
  bins: Bin[],
  binColors: string[],
  binTextColors: string[],
  binShares: number[],
}

function MapLegend ({ bins, binColors, binTextColors, binShares }: Props): React.Node {
  if (!bins || bins.length === 0) {
    return null
  }

  return (
    <div className="c-stats-map-legend pt-typography">
      <div className="c-stats-map-legend__title">
        <FormattedMessage id="cases.stats.show.mapLegendTitle" />
        <Popover
          position={Position.TOP}
          content={
            <div className="c-stats-map-legend__popover">
              <h6 className="c-stats-map-legend__popover-heading">
                <FormattedMessage id="cases.stats.show.mapLegendHelpTitle" />
              </h6>
              <p className="c-stats-map-legend__popover-text">
                <FormattedMessage id="cases.stats.show.mapLegendHelpDescription" />
              </p>
            </div>
          }
        >
          <span className="c-stats-map-legend__help-icon">
            <Icon icon="info-sign" />
          </span>
        </Popover>
      </div>

      <div className="c-stats-map-legend__stack">
        {bins.map((b, i) => {
          const share = binShares[i] || 0
          const width = `${Math.max(share, 1)}%`
          const rangeLabel = b.label || (
            Number.isFinite(b.min) && Number.isFinite(b.max)
              ? `${b.min}-${b.max}`
              : ''
          )
          const borderRadius = bins.length === 1
            ? '6px'
            : i === 0
              ? '6px 0 0 6px'
              : i === bins.length - 1
                ? '0 6px 6px 0'
                : '0'

          return (
            <div
              key={i}
              className="c-stats-map-legend__segment"
              style={{ background: binColors[i], width, borderRadius }}
              title={`${rangeLabel || b.label} visitors (${share.toFixed(1)}%)`}
            >
              <span className="c-stats-map-legend__label" style={{ color: binTextColors[i] }}>
                {share.toFixed(0)}%
              </span>
            </div>
          )
        })}
      </div>
      <div className="c-stats-map-legend__ranges">
        {bins.map((b, i) => {
          const rangeLabel = b.label || (
            Number.isFinite(b.min) && Number.isFinite(b.max)
              ? `${b.min}-${b.max}`
              : ''
          )
          const share = binShares[i] || 0
          const width = `${Math.max(share, 1)}%`
          return (
            <div
              key={`range-${i}`}
              className="c-stats-map-legend__range"
              style={{ width }}
              title={rangeLabel}
            >
              {rangeLabel}
            </div>
          )
        })}
      </div>

    </div>
  )
}

export default React.memo<Props>(MapLegend)
