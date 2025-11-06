/* @flow */
import React from 'react'
import styled from 'styled-components'
import { FormattedMessage } from 'react-intl'
import { theme } from '../utility/styledComponents'
import { Colors } from '@blueprintjs/core'

// Styled Components - designed to work inside pt-card wrapper
const SummaryWrapper = styled.div`
  font-family: ${theme.sansFont};
  height: 100%;
  display: flex;
  flex-direction: column;
`

const SummaryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid ${Colors.LIGHT_GRAY1};
`

const SummaryTitle = styled.h2`
  font-size: 11px;
  color: ${Colors.GRAY2};
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  margin: 0;
  font-family: ${theme.sansFont};
`

const PublishedDate = styled.div`
  font-size: 12px;
  color: ${Colors.GRAY3};
  font-weight: 400;
  font-family: ${theme.sansFont};
  
  strong {
    font-weight: 600;
    color: ${Colors.GRAY2};
  }
`

const SummaryContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
`

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  
  &:first-child {
    padding-top: 0;
  }
`

const SummaryLabel = styled.span`
  font-size: 14px;
  color: ${Colors.GRAY2};
  font-weight: 500;
  font-family: ${theme.sansFont};
`

const SummaryValue = styled.span`
  font-size: 16px;
  color: ${Colors.DARK_GRAY1};
  font-weight: 600;
  font-family: ${theme.sansFont};
  letter-spacing: -0.3px;
  font-variant-numeric: tabular-nums;
`

const NoDataMessage = styled.div`
  padding: 48px 20px;
  text-align: center;
  color: ${Colors.GRAY3};
  font-size: 14px;
  font-family: ${theme.sansFont};
  background: ${Colors.LIGHT_GRAY5};
  border-radius: 4px;
  font-style: italic;
`

const SkeletonWrapper = styled(SummaryWrapper)`
  .pt-skeleton {
    border-radius: 4px;
  }
`

const SkeletonHeader = styled(SummaryHeader)``

const SkeletonRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  
  &:first-child {
    padding-top: 0;
  }
`

type Props = {
  summary: {
    total_visits?: number,
    country_count?: number,
    total_deployments?: number,
    total_podcast_listens?: number,
    case_published_at?: string,
    case_locales?: string,
  },
  hasData: boolean,
  isLoading?: boolean,
}

/**
 * StatsSummary loading skeleton
 */
export function StatsSummarySkeleton () {
  return (
    <SkeletonWrapper>
      <SkeletonHeader>
        <div className="pt-skeleton" style={{ height: '14px', width: '80px' }} />
        <div className="pt-skeleton" style={{ height: '14px', width: '110px' }} />
      </SkeletonHeader>

      <SummaryContent>
        <SkeletonRow>
          <div className="pt-skeleton" style={{ height: '16px', width: '130px' }} />
          <div className="pt-skeleton" style={{ height: '18px', width: '70px' }} />
        </SkeletonRow>
        <SkeletonRow>
          <div className="pt-skeleton" style={{ height: '16px', width: '80px' }} />
          <div className="pt-skeleton" style={{ height: '18px', width: '40px' }} />
        </SkeletonRow>
        <SkeletonRow>
          <div className="pt-skeleton" style={{ height: '16px', width: '110px' }} />
          <div className="pt-skeleton" style={{ height: '18px', width: '50px' }} />
        </SkeletonRow>
        <SkeletonRow>
          <div className="pt-skeleton" style={{ height: '16px', width: '120px' }} />
          <div className="pt-skeleton" style={{ height: '18px', width: '45px' }} />
        </SkeletonRow>
        <SkeletonRow>
          <div className="pt-skeleton" style={{ height: '16px', width: '100px' }} />
          <div className="pt-skeleton" style={{ height: '18px', width: '80px' }} />
        </SkeletonRow>
      </SummaryContent>
    </SkeletonWrapper>
  )
}

/**
 * StatsSummary component displays summary statistics in a card
 * @param {Object} summary - Summary statistics object
 * @param {boolean} hasData - Whether there is data to display
 * @param {boolean} isLoading - Whether the data is loading
 */
function StatsSummary ({ summary, hasData, isLoading }: Props) {
  if (isLoading) {
    return <StatsSummarySkeleton />
  }

  if (!hasData) {
    return (
      <NoDataMessage>
        <FormattedMessage id="cases.stats.show.noData" />
      </NoDataMessage>
    )
  }

  return (
    <SummaryWrapper>
      <SummaryHeader>
        <SummaryTitle>
          <FormattedMessage id="cases.stats.show.summaryTitle" />
        </SummaryTitle>
        {summary.case_published_at && (
          <PublishedDate>
            <strong>pub:</strong>{' '}
            {new Date(summary.case_published_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </PublishedDate>
        )}
      </SummaryHeader>

      <SummaryContent>
        <SummaryRow>
          <SummaryLabel>
            <FormattedMessage id="cases.stats.show.totalUniqueVisitors" />
          </SummaryLabel>
          <SummaryValue>
            {(summary.total_visits || 0).toLocaleString()}
          </SummaryValue>
        </SummaryRow>

        <SummaryRow>
          <SummaryLabel>
            <FormattedMessage id="cases.stats.show.countries" />
          </SummaryLabel>
          <SummaryValue>{summary.country_count || 0}</SummaryValue>
        </SummaryRow>

        <SummaryRow>
          <SummaryLabel>
            <FormattedMessage id="cases.stats.show.totalDeployments" />
          </SummaryLabel>
          <SummaryValue>
            {(summary.total_deployments || 0).toLocaleString()}
          </SummaryValue>
        </SummaryRow>

        <SummaryRow>
          <SummaryLabel>
            <FormattedMessage id="cases.stats.show.podcastListensShort" />
          </SummaryLabel>
          <SummaryValue>
            {(summary.total_podcast_listens || 0).toLocaleString()}
          </SummaryValue>
        </SummaryRow>

        {summary.case_locales && (
          <SummaryRow>
            <SummaryLabel>
              <FormattedMessage id="cases.stats.show.translations" />
            </SummaryLabel>
            <SummaryValue>
              {summary.case_locales}
            </SummaryValue>
          </SummaryRow>
        )}
      </SummaryContent>
    </SummaryWrapper>
  )
}

export default StatsSummary
