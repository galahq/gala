/* @flow */
import * as React from 'react'
import { Popover, Position } from '@blueprintjs/core'
import { FormattedMessage, injectIntl } from 'react-intl'
import type { StatsBin } from '../types'

type Props = {
  bins: StatsBin[],
  binColors: string[],
  binTextColors: string[],
  intl: any,
}

function MapLegend ({
  bins,
  binColors,
  binTextColors,
  intl,
}: Props): React.Node {
  if (!bins || bins.length === 0) {
    return null
  }

  return (
    <div className="c-stats-map-legend pt-typography">
      <div className="c-stats-map-legend__title">
        <FormattedMessage id="cases.stats.show.mapLegendTitle" />
        <Popover
          position={Position.TOP_LEFT}
          hoverOpenDelay={100}
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
          <button
            type="button"
            className="pt-button pt-minimal pt-small pt-icon-info-sign c-stats-map-legend__help-icon"
            aria-label={intl.formatMessage({
              id: 'cases.stats.show.mapLegendHelpTitle',
            })}
          />
        </Popover>
      </div>

      <div className="c-stats-map-legend__stack">
        {bins.map((b, i) => {
          const width = `${100 / bins.length}%`

          let borderRadius = '0'
          if (bins.length === 1) {
            borderRadius = '4px'
          } else if (i === 0) {
            borderRadius = '4px 0 0 4px'
          } else if (i === bins.length - 1) {
            borderRadius = '0 4px 4px 0'
          }

          return (
            <div
              key={i}
              className="c-stats-map-legend__segment"
              style={{
                background: binColors[i],
                borderRadius,
                width,
              }}
              title={b.label}
            >
              <span
                className="c-stats-map-legend__label"
                style={{ color: binTextColors[i] }}
              >
                {b.label}
              </span>
            </div>
          )
        })}
      </div>

      <div className="c-stats-map-legend__footer">
        <span className="c-stats-map-legend__footer-label">
          <FormattedMessage id="cases.stats.show.mapLegendLow" />
        </span>
        <span className="c-stats-map-legend__footer-label">
          <FormattedMessage id="cases.stats.show.mapLegendHigh" />
        </span>
      </div>
    </div>
  )
}

export default injectIntl(React.memo<Props>(MapLegend))
