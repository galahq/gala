/** @jsx React.createElement */
/*  */

import React from 'react'
import { FormattedMessage } from 'react-intl'

export function MapLoadingOverlay () {
  return (
    <div className="c-stats-map__loading-overlay">
      <div className="bp6-spinner bp6-large">
        <div className="bp6-spinner-animation">
          <svg viewBox="0 0 100 100">
            <path
              className="bp6-spinner-track"
              d="M 50,50 m 0,-44.5 a 44.5,44.5 0 1 1 0,89 a 44.5,44.5 0 1 1 0,-89"
            />
            <path
              className="bp6-spinner-head"
              d="M 50,50 m 0,-44.5 a 44.5,44.5 0 1 1 0,89 a 44.5,44.5 0 1 1 0,-89"
              pathLength="280"
              strokeDasharray="280 280"
              strokeDashoffset="210"
            />
          </svg>
        </div>
      </div>
      <div className="c-stats-map__loading-text bp6-text-muted">
        <FormattedMessage id="cases.stats.show.loadingMapData" />
      </div>
    </div>
  )
}

function SkeletonRow ({
  labelWidth,
  valueWidth,
}) {
  return (
    <div className="c-stats-summary__row">
      <div className="bp6-skeleton" style={{ height: '16px', width: labelWidth, minWidth: labelWidth }} />
      <div className="bp6-skeleton" style={{ height: '16px', width: valueWidth, minWidth: valueWidth }} />
    </div>
  )
}

export function SummaryLoadingSkeleton () {
  return (
    <div className="c-stats-summary__content">
      <SkeletonRow labelWidth="140px" valueWidth="60px" />
      <SkeletonRow labelWidth="70px" valueWidth="30px" />
      <SkeletonRow labelWidth="120px" valueWidth="50px" />
      <SkeletonRow labelWidth="120px" valueWidth="40px" />
    </div>
  )
}

function InformationSkeletonRow ({
  labelWidth,
  valueWidth,
}) {
  return (
    <div className="c-stats-information__row">
      <div className="bp6-skeleton" style={{ height: '16px', width: labelWidth, minWidth: labelWidth }} />
      <div className="bp6-skeleton" style={{ height: '16px', width: valueWidth, minWidth: valueWidth }} />
    </div>
  )
}

export function InformationLoadingSkeleton () {
  return (
    <div className="c-stats-information__content">
      <InformationSkeletonRow labelWidth="180px" valueWidth="60px" />
      <InformationSkeletonRow labelWidth="150px" valueWidth="30px" />
      <InformationSkeletonRow labelWidth="150px" valueWidth="80px" />
      <InformationSkeletonRow labelWidth="70px" valueWidth="100px" />
      <InformationSkeletonRow labelWidth="130px" valueWidth="40px" />
    </div>
  )
}

export function TableLoadingSkeleton () {
  return (
    <div className="bp6-card c-stats-skeleton-card">
      <div className="bp6-skeleton c-stats-skeleton--table-header" />
      <div className="bp6-skeleton c-stats-skeleton--table-body" />
    </div>
  )
}

export function PageLoadingSkeleton () {
  return (
    <div className="c-stats-page c-stats-page--loading">
      <div className="bp6-skeleton c-stats-skeleton--page-title" />
      <div className="c-stats-information-container">
        <div className="c-stats-overview-layout">
          <div className="c-stats-information bp6-card bp6-elevation-1">
            <div className="bp6-skeleton c-stats-skeleton--info-header" />
            <InformationLoadingSkeleton />
          </div>
          <div className="bp6-skeleton bp6-callout c-stats-skeleton--callout" />
        </div>
      </div>

      <div className="bp6-skeleton c-stats-skeleton--section-title" />
      <div className="c-stats-layout">
        <div className="bp6-card bp6-elevation-1 c-stats-skeleton--map-card">
          <div className="bp6-skeleton c-stats-skeleton--map-content" />
        </div>
        <div className="c-stats-summary bp6-card bp6-elevation-1 c-stats-skeleton--summary-card">
          <SummaryLoadingSkeleton />
        </div>
      </div>

      <div className="c-stats-map-table-card bp6-card bp6-elevation-1">
        <div className="bp6-skeleton c-stats-skeleton--map-table-header" />
        <div className="bp6-skeleton c-stats-skeleton--map-table-map" />
        <div className="bp6-skeleton c-stats-skeleton--map-table-table" />
      </div>
    </div>
  )
}
