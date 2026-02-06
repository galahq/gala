/** @jsx React.createElement */
/* @flow */

import React from 'react'

export function MapLoadingOverlay (): React$Node {
  return (
    <div className="c-stats-map__loading-overlay">
      <div className="pt-spinner pt-large">
        <div className="pt-spinner-svg-container">
          <svg viewBox="0 0 100 100">
            <path
              className="pt-spinner-track"
              d="M 50,50 m 0,-44.5 a 44.5,44.5 0 1 1 0,89 a 44.5,44.5 0 1 1 0,-89"
            />
            <path
              className="pt-spinner-head"
              d="M 50,50 m 0,-44.5 a 44.5,44.5 0 1 1 0,89 a 44.5,44.5 0 1 1 0,-89"
              pathLength="280"
              strokeDasharray="280 280"
              strokeDashoffset="210"
            />
          </svg>
        </div>
      </div>
      <div className="c-stats-map__loading-text pt-text-muted">
        Loading map data...
      </div>
    </div>
  )
}

function SkeletonRow ({
  labelWidth,
  valueWidth,
}: {
  labelWidth: string,
  valueWidth: string,
}): React$Node {
  return (
    <div className="c-stats-summary__row">
      <div className="pt-skeleton" style={{ height: '16px', width: labelWidth, minWidth: labelWidth }} />
      <div className="pt-skeleton" style={{ height: '16px', width: valueWidth, minWidth: valueWidth }} />
    </div>
  )
}

export function SummaryLoadingSkeleton (): React$Node {
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
}: {
  labelWidth: string,
  valueWidth: string,
}): React$Node {
  return (
    <div className="c-stats-information__row">
      <div className="pt-skeleton" style={{ height: '16px', width: labelWidth, minWidth: labelWidth }} />
      <div className="pt-skeleton" style={{ height: '16px', width: valueWidth, minWidth: valueWidth }} />
    </div>
  )
}

export function InformationLoadingSkeleton (): React$Node {
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

export function TableLoadingSkeleton (): React$Node {
  return (
    <div className="pt-card c-stats-skeleton-card">
      <div className="pt-skeleton c-stats-skeleton--table-header" />
      <div className="pt-skeleton c-stats-skeleton--table-body" />
    </div>
  )
}

export function PageLoadingSkeleton (): React$Node {
  return (
    <div className="c-stats-page c-stats-page--loading">
      <div className="pt-skeleton c-stats-skeleton--page-title" />
      <div className="c-stats-information-container">
        <div className="c-stats-overview-layout">
          <div className="c-stats-information pt-card pt-elevation-1">
            <div className="pt-skeleton c-stats-skeleton--info-header" />
            <InformationLoadingSkeleton />
          </div>
          <div className="pt-skeleton pt-callout c-stats-skeleton--callout" />
        </div>
      </div>

      <div className="pt-skeleton c-stats-skeleton--section-title" />
      <div className="c-stats-layout">
        <div className="pt-card pt-elevation-1 c-stats-skeleton--map-card">
          <div className="pt-skeleton c-stats-skeleton--map-content" />
        </div>
        <div className="c-stats-summary pt-card pt-elevation-1 c-stats-skeleton--summary-card">
          <SummaryLoadingSkeleton />
        </div>
      </div>

      <div className="c-stats-map-table-card pt-card pt-elevation-1">
        <div className="pt-skeleton c-stats-skeleton--map-table-header" />
        <div className="pt-skeleton c-stats-skeleton--map-table-map" />
        <div className="pt-skeleton c-stats-skeleton--map-table-table" />
      </div>
    </div>
  )
}
