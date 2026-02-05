/* @flow */
import * as React from 'react'
import { Popover, Position, Icon } from '@blueprintjs/core'
import { FormattedMessage } from 'react-intl'

import { Colors } from '../colors'

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

/**
 * Map legend showing visitor distribution color scale
 */
function MapLegend ({ bins, binColors, binTextColors }: Props): React.Node {
  if (!bins || bins.length === 0) {
    return null
  }

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        background: 'rgba(42, 42, 42, 1.0)',
        padding: '12px',
        borderRadius: '0 6px 0 0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        zIndex: 1,
        minWidth: '200px',
      }}
    >
      <div
        style={{
          fontWeight: 'bold',
          marginBottom: '8px',
          fontSize: '12px',
          color: Colors.WHITE,
          fontFamily: 'monospace',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <FormattedMessage id="cases.stats.show.mapLegendTitle" />
        <Popover
          position={Position.TOP}
          content={
            <div style={{ padding: '12px', maxWidth: '300px' }}>
              <h6 style={{ marginTop: 0, marginBottom: '8px' }}>
                <FormattedMessage id="cases.stats.show.mapLegendHelpTitle" />
              </h6>
              <p style={{ fontSize: '12px' }}>
                <FormattedMessage id="cases.stats.show.mapLegendHelpDescription" />
              </p>
            </div>
          }
        >
          <Icon
            icon="info-sign"
            style={{
              cursor: 'pointer',
              opacity: 0.8,
              fontSize: '10px',
            }}
          />
        </Popover>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 0,
          borderRadius: '4px',
          overflow: 'hidden',
        }}
      >
        {bins.map((b, i) => {
          // Calculate border-radius for each bar to fill the rounded container
          let borderRadius = '0'
          if (bins.length === 1) {
            borderRadius = '4px'
          } else if (i === 0) {
            borderRadius = '4px 0 0 4px'
          } else if (i === bins.length - 1) {
            borderRadius = '0 4px 4px 0'
          }

          return (
            <div key={i} style={{ position: 'relative', flex: 1 }}>
              <div
                style={{
                  height: '24px',
                  background: binColors[i],
                  border: 'none',
                  borderRadius,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title={`${b.label} visitors`}
              >
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 'bold',
                    color: binTextColors[i],
                    lineHeight: '1',
                    fontFamily: 'monospace',
                  }}
                >
                  {b.label}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '11px',
          marginTop: '6px',
          color: Colors.WHITE,
          fontFamily: 'monospace',
        }}
      >
        <span style={{ fontWeight: 'bold' }}>
          <FormattedMessage id="cases.stats.show.mapLegendLow" />
        </span>
        <span style={{ fontWeight: 'bold' }}>
          <FormattedMessage id="cases.stats.show.mapLegendHigh" />
        </span>
      </div>
    </div>
  )
}

export default React.memo<Props>(MapLegend)
