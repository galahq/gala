/** @jsx React.createElement */
/* @flow */

import React from 'react'

/**
 * Loading overlay for the map component
 */
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

/**
 * Skeleton row component for loading states
 */
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

/**
 * Loading skeleton for the summary section
 */
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

/**
 * Skeleton row component for information section
 */
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

/**
 * Loading skeleton for the information section
 */
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

/**
 * Loading skeleton for the table section
 */
export function TableLoadingSkeleton (): React$Node {
  return (
    <div className="pt-card" style={{ padding: '20px', marginTop: '24px', minWidth: '400px' }}>
      <div
        className="pt-skeleton"
        style={{ height: '20px', width: '200px', minWidth: '200px', marginBottom: '20px' }}
      />
      <div className="pt-skeleton" style={{ height: '300px', minWidth: '100%' }} />
    </div>
  )
}

/**
 * Full page loading skeleton for initial hydration
 * Shows a unified loading state to prevent multiple visual transitions
 */
export function PageLoadingSkeleton (): React$Node {
  return (
    <div className="c-stats-page c-stats-page--loading">
      <div className="pt-skeleton" style={{ height: '28px', width: '120px', minWidth: '120px', marginBottom: '16px' }} />
      <div className="c-stats-information-container" style={{ minWidth: '600px' }}>
        <div className="c-stats-overview-layout">
          <div className="c-stats-information pt-card pt-elevation-1" style={{ minWidth: '300px' }}>
            <div className="pt-skeleton" style={{ height: '20px', width: '140px', minWidth: '140px', marginBottom: '16px' }} />
            <InformationLoadingSkeleton />
          </div>
          <div className="pt-skeleton pt-callout" style={{ height: '120px', minWidth: '280px' }} />
        </div>
      </div>

      <div className="pt-skeleton" style={{ height: '28px', width: '150px', minWidth: '150px', marginTop: '32px', marginBottom: '16px' }} />
      <div className="c-stats-layout" style={{ minWidth: '600px' }}>
        <div className="pt-card pt-elevation-1" style={{ minHeight: '320px', minWidth: '400px' }}>
          <div className="pt-skeleton" style={{ height: '100%', minHeight: '300px', minWidth: '380px' }} />
        </div>
        <div className="c-stats-summary pt-card pt-elevation-1" style={{ minWidth: '200px' }}>
          <SummaryLoadingSkeleton />
        </div>
      </div>

      <div className="c-stats-map-table-card pt-card pt-elevation-1" style={{ marginTop: '24px', minWidth: '600px' }}>
        <div className="pt-skeleton" style={{ height: '24px', width: '200px', minWidth: '200px', marginBottom: '16px' }} />
        <div className="pt-skeleton" style={{ height: '400px', minWidth: '100%', marginBottom: '24px' }} />
        <div className="pt-skeleton" style={{ height: '200px', minWidth: '100%' }} />
      </div>
    </div>
  )
}

export default {
  MapLoadingOverlay,
  SummaryLoadingSkeleton,
  InformationLoadingSkeleton,
  TableLoadingSkeleton,
  PageLoadingSkeleton,
}
