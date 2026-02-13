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
}

function MapLegend ({ bins, binColors, binTextColors }: Props): React.Node {
  if (!bins || bins.length === 0) {
    return null
  }

  return (
    <div className="c-stats-map-legend">
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

      <div className="c-stats-map-legend__bins">
        {bins.map((b, i) => {
          let borderRadius = '0'
          if (bins.length === 1) {
            borderRadius = '4px'
          } else if (i === 0) {
            borderRadius = '4px 0 0 4px'
          } else if (i === bins.length - 1) {
            borderRadius = '0 4px 4px 0'
          }

          return (
            <div className="c-stats-map-legend__bin" key={i}>
              <div
                className="c-stats-map-legend__bar"
                style={{ background: binColors[i], borderRadius }}
                title={`${b.label} visitors`}
              >
                <span className="c-stats-map-legend__label" style={{ color: binTextColors[i] }}>
                  {b.label}
                </span>
              </div>
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

export default React.memo<Props>(MapLegend)
