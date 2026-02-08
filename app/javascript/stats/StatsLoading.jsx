/** @jsx React.createElement */
/* @flow */

import React from 'react'

function SkeletonRow ({
  labelWidth,
  valueWidth,
}: {
  labelWidth: string,
  valueWidth: string,
}): React$Node {
  return (
    <div className="c-stats-summary__row">
      <div
        className="pt-skeleton"
        style={{ height: '16px', width: labelWidth, minWidth: labelWidth }}
      />
      <div
        className="pt-skeleton"
        style={{ height: '16px', width: valueWidth, minWidth: valueWidth }}
      />
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
      <div
        className="pt-skeleton"
        style={{ height: '16px', width: labelWidth, minWidth: labelWidth }}
      />
      <div
        className="pt-skeleton"
        style={{ height: '16px', width: valueWidth, minWidth: valueWidth }}
      />
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

export function MapLoadingSkeleton (): React$Node {
  return (
    <div className="c-stats-map-loading-state">
      <div className="pt-skeleton c-stats-skeleton--map" />
    </div>
  )
}

export function InlineLoadingSpinner ({ label }: { label: string }): React$Node {
  return <span className="c-stats-inline-loading">{label}</span>
}
