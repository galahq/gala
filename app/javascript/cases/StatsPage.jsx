/**
 * @providesModule StatsPage
 * @flow
 */

import * as React from 'react'
import { useState, useEffect, useCallback, useRef } from 'react'
import { injectIntl } from 'react-intl'
import styled from 'styled-components'
import { CSRF, sessionId } from 'shared/orchard'
import { Popover, Position, Button } from '@blueprintjs/core'
import { DateRangePicker } from '@blueprintjs/datetime'

// Import BlueprintJS datetime styles
import '@blueprintjs/datetime/lib/css/blueprint-datetime.css'

import type { IntlShape } from 'react-intl'

const StatsContainer = styled.div`
  padding: 20px;
`

const StatsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  
  th, td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #d3d8de;
  }
  
  th {
    background-color: #f5f8fa;
    font-weight: 600;
    color: #182026;
  }
  
  tr:hover {
    background-color: #f5f8fa;
  }
`

const MobileDateRangePicker = styled.div`
  @media (max-width: 768px) {
    .bp3-date-range-picker {
      flex-direction: column;
    }
    
    .bp3-date-range-picker .bp3-date-input {
      margin-bottom: 10px;
    }
  }
`

// Reusable components for the stats table
const StatsTableHeader = ({ intl, dateRange, isDatePickerOpen, setIsDatePickerOpen, handleDateRangeChange, formatDateRange, shortcuts, statsData }) => (
  <thead>
    <tr>
      <th>
        {intl.formatMessage({
          id: "cases.stats.show.activity",
          defaultMessage: "Activity"
        })}
      </th>
      <th>
        {intl.formatMessage({
          id: "cases.stats.show.all_time",
          defaultMessage: "All Time"
        })}
      </th>
      <th>
        <Popover
          isOpen={isDatePickerOpen}
          onInteraction={(nextOpenState) => setIsDatePickerOpen(nextOpenState)}
          position={Position.BOTTOM_RIGHT}
          content={
            <div style={{ padding: '15px', minWidth: '400px' }}>
              <MobileDateRangePicker>
                <DateRangePicker
                  value={[dateRange.start, dateRange.end]}
                  onChange={handleDateRangeChange}
                  shortcuts={shortcuts}
                  allowSingleDayRange={true}
                  maxDate={new Date()}
                  minDate={statsData ? new Date(statsData.caseCreatedAt) : new Date(2020, 0, 1)}
                />
              </MobileDateRangePicker>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'flex-end', 
                gap: '10px', 
                marginTop: '15px', 
                paddingTop: '15px',
                borderTop: '1px solid #d3d8de'
              }}>
                <Button
                  text={intl.formatMessage({
                    id: "cases.stats.show.reset",
                    defaultMessage: "Reset"
                  })}
                  onClick={() => {
                    const defaultRange = {
                      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                      end: new Date(),
                    }
                    setDateRange(defaultRange)
                    handleDateRangeChange(defaultRange)
                  }}
                  minimal
                />
                <Button
                  text={intl.formatMessage({
                    id: "cases.stats.show.apply",
                    defaultMessage: "Apply"
                  })}
                  intent="primary"
                  onClick={() => {
                    setIsDatePickerOpen(false)
                  }}
                />
              </div>
            </div>
          }
        >
          <span 
            style={{ cursor: 'pointer', textDecoration: 'underline' }}
            onClick={() => setIsDatePickerOpen(true)}
          >
            {formatDateRange(dateRange)}
          </span>
        </Popover>
      </th>
    </tr>
  </thead>
)

const StatsRow = ({ intl, label, allTimeValue, customRangeValue, loading, isPodcast = false, podcastTitle = null }) => (
  <tr>
    <td>
      {isPodcast 
        ? intl.formatMessage({
            id: "cases.stats.show.podcast_listens",
            defaultMessage: "Podcast Listens - {podcast_title}"
          }, { podcast_title: podcastTitle })
        : label
      }
    </td>
    <td>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between' 
      }}>
        <span>{allTimeValue}</span>
        {loading && (
          <div style={{
            fontSize: '12px',
            color: '#5c7080',
            marginLeft: '8px'
          }}>
            {intl.formatMessage({
              id: "cases.stats.show.loading",
              defaultMessage: "Loading..."
            })}
          </div>
        )}
      </div>
    </td>
    <td>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between' 
      }}>
        <span>{customRangeValue}</span>
        {loading && (
          <div style={{
            fontSize: '12px',
            color: '#5c7080',
            marginLeft: '8px'
          }}>
            {intl.formatMessage({
              id: "cases.stats.show.loading",
              defaultMessage: "Loading..."
            })}
          </div>
        )}
      </div>
    </td>
  </tr>
)

const CaseInfoSection = ({ intl, statsData }) => (
  <div style={{ 
    marginBottom: '20px', 
    padding: '15px', 
    backgroundColor: '#f8f9fa', 
    borderRadius: '3px',
    border: '1px solid #e9ecef'
  }}>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
      <div>
        <strong>
          {intl.formatMessage({
            id: "cases.stats.show.created",
            defaultMessage: "Created"
          })}:
        </strong>
        <br />
        {statsData?.caseCreatedAt ? new Date(statsData.caseCreatedAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }) : 'N/A'}
      </div>
      <div>
        <strong>
          {intl.formatMessage({
            id: "cases.stats.show.published",
            defaultMessage: "Published"
          })}:
        </strong>
        <br />
        {statsData?.casePublishedAt ? new Date(statsData.casePublishedAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }) : 'Not published'}
      </div>
      <div>
        <strong>
          {intl.formatMessage({
            id: "cases.stats.show.last_updated",
            defaultMessage: "Last Updated"
          })}:
        </strong>
        <br />
        {statsData?.caseUpdatedAt ? new Date(statsData.caseUpdatedAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }) : 'N/A'}
      </div>
    </div>
  </div>
)

const DisclaimerSection = ({ intl }) => (
  <div style={{ 
    marginTop: '20px', 
    padding: '15px', 
    backgroundColor: '#e1f5fe', 
    borderRadius: '3px',
    border: '1px solid #b3e5fc'
  }}>
    <p style={{ margin: 0, fontSize: '14px', color: '#0277bd' }}>
      {intl.formatMessage({
        id: "cases.stats.show.disclaimer",
        defaultMessage: "Totals count only users that were signed-in to Gala when viewing the case. 'Unique Visits' counts readers who viewed a page beyond the overview page of your case. Readers' browser settings may impact the accuracy of these counts."
      })}
    </p>
  </div>
)

const loadStats = async (caseSlug: string, dateRange: DateRange, setLoading: Function, setError: Function, setStatsData: Function, currentRequestRef: any) => {
  setLoading(true)
  setError(null)
  
  try {
    // Ensure dateRange is properly defined
    if (!dateRange || !dateRange.start || !dateRange.end) {
      console.error('Invalid dateRange:', dateRange)
      setError('Invalid date range. Please try again.')
      setLoading(false)
      return
    }
    
    // Create cache key for this request
    const cacheKey = `${caseSlug}-${dateRange.start.toISOString().split('T')[0]}-${dateRange.end.toISOString().split('T')[0]}`
    
    // Debug: Log the date range being sent
    
    // Check if we have cached data
    if (loadStats.cache && loadStats.cache[cacheKey]) {
      console.log('Using cached data for:', cacheKey)
      setStatsData(loadStats.cache[cacheKey])
      setLoading(false)
      return
    }
    
    // Cancel previous request if it exists
    if (currentRequestRef.current) {
      currentRequestRef.current.abort()
    }
    
    // Create AbortController for this request
    const abortController = new AbortController()
    currentRequestRef.current = abortController
    
    // Use custom fetch instead of Orchard.harvest since it doesn't support PATCH
    const body = JSON.stringify({
      start_date: new Date(dateRange.start.getTime() - dateRange.start.getTimezoneOffset() * 60000).toISOString().split('T')[0],
      end_date: new Date(dateRange.end.getTime() - dateRange.end.getTimezoneOffset() * 60000).toISOString().split('T')[0],
    })
    
    const r = new Request(`/cases/${caseSlug}/stats`, {
      credentials: 'same-origin',
      method: 'PATCH',
      body,
      headers: new Headers({
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Session-ID': sessionId(),
        ...CSRF.header(),
      }),
      signal: abortController.signal,
    })
    
    const response = await fetch(r).then(async (response) => {
      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`)
      }
      return response.json()
    })
    
    // Check if request was cancelled
    if (abortController.signal.aborted) {
      return
    }
    
    // Cache the response
    if (!loadStats.cache) {
      loadStats.cache = {}
    }
    loadStats.cache[cacheKey] = response
    
    // Limit cache size to prevent memory issues
    const cacheKeys = Object.keys(loadStats.cache)
    if (cacheKeys.length > 10) {
      const oldestKey = cacheKeys[0]
      delete loadStats.cache[oldestKey]
    }
    
    setStatsData(response)
    setLoading(false)
  } catch (error) {
    // Don't set error if request was cancelled
    if (error.name === 'AbortError') {
      return
    }
    console.error('Error loading stats:', error)
    setError('Failed to load statistics. Please try again.')
    setLoading(false)
  }
}

type DateRange = {
  start: Date,
  end: Date,
}

type Props = {
  intl: IntlShape,
  caseSlug: string,
}

const StatsPage = ({ intl, caseSlug }: Props) => {
  const defaultRange = {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    end: new Date(),
  }

  const [statsData, setStatsData] = useState<?StatsData>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<?string>(null)
  const [dateRange, setDateRange] = useState<DateRange>(defaultRange)
  const [loadStatsTimeout, setLoadStatsTimeout] = useState<?TimeoutID>(null)
  const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false)

  // Track current request to prevent multiple simultaneous requests
  const currentRequestRef = useRef(null)

  const handleDateRangeChange = useCallback((dateRange: DateRange | Date[]) => {
    // BlueprintJS DateRangePicker returns an array [startDate, endDate]
    // but our code expects an object {start: date, end: date}
    if (Array.isArray(dateRange)) {
      const [start, end] = dateRange
      setDateRange({ start, end })
    } else {
      // Handle object format if needed
      setDateRange(dateRange)
    }
  }, [])

  const formatDateRange = useCallback((dateRange: DateRange) => {
    // Validate dates before formatting
    if (!dateRange || !dateRange.start || !dateRange.end) {
      return intl.formatMessage({
        id: "cases.stats.show.custom_range",
        defaultMessage: "Custom Range"
      })
    }
    
    // Ensure dates are valid Date objects
    const startDate = dateRange.start instanceof Date ? dateRange.start : new Date(dateRange.start)
    const endDate = dateRange.end instanceof Date ? dateRange.end : new Date(dateRange.end)
    
    // Check if dates are valid
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return intl.formatMessage({
        id: "cases.stats.show.custom_range",
        defaultMessage: "Custom Range"
      })
    }
    
    try {
      const startDateStr = intl.formatDate(startDate, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
      const endDateStr = intl.formatDate(endDate, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
      return `${startDateStr} - ${endDateStr}`
    } catch (error) {
      console.error('Error formatting date range:', error)
      return intl.formatMessage({
        id: "cases.stats.show.custom_range",
        defaultMessage: "Custom Range"
      })
    }
  }, [intl])

  // Load stats on mount
  useEffect(() => {
    loadStats(caseSlug, dateRange, setLoading, setError, setStatsData, currentRequestRef)
  }, []) // Empty dependency array

  // Load stats when date range changes
  useEffect(() => {
    // Only load stats if both start and end dates are valid
    const { start, end } = dateRange
    if (start && end && !isNaN(start.getTime()) && !isNaN(end.getTime())) {
      // Add a delay to prevent interrupting date picker interaction
      if (loadStatsTimeout) {
        clearTimeout(loadStatsTimeout)
      }
      const timeout = setTimeout(() => {
        loadStats(caseSlug, dateRange, setLoading, setError, setStatsData, currentRequestRef)
      }, 500) // 500ms delay
      setLoadStatsTimeout(timeout)
    }
  }, [dateRange]) // Only depend on dateRange, not loadStatsTimeout

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (loadStatsTimeout) {
        clearTimeout(loadStatsTimeout)
      }
    }
  }, [loadStatsTimeout])

  // Define shortcuts for the date picker
  const shortcuts = [
    {
      label: 'Last 7 days',
      dateRange: [
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        new Date(),
      ],
    },
    {
      label: 'Last 30 days',
      dateRange: [
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        new Date(),
      ],
    },
    {
      label: 'Last 90 days',
      dateRange: [
        new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        new Date(),
      ],
    },
    {
      label: 'This month',
      dateRange: [
        new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        new Date(),
      ],
    },
    {
      label: 'Last month',
      dateRange: [
        new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
        new Date(new Date().getFullYear(), new Date().getMonth(), 0),
      ],
    },
  ]

  if (loading) {
    return (
      <StatsContainer>
        <h1 className="admin__title">
          {intl.formatMessage({
            id: "cases.stats.show.case_stats",
            defaultMessage: "Case Stats"
          })}
        </h1>
        
        {/* Case Information Section */}
        <CaseInfoSection intl={intl} statsData={statsData} />
        
        <StatsTable>
          <StatsTableHeader intl={intl} dateRange={dateRange} isDatePickerOpen={isDatePickerOpen} setIsDatePickerOpen={setIsDatePickerOpen} handleDateRangeChange={handleDateRangeChange} formatDateRange={formatDateRange} shortcuts={shortcuts} statsData={statsData} />
          <tbody>
            <StatsRow 
              intl={intl}
              label={intl.formatMessage({
                id: "cases.stats.show.deployments",
                defaultMessage: "Deployments"
              })}
              allTimeValue={statsData?.deployments?.allTime || 0}
              customRangeValue={statsData?.deployments?.customRange || 0}
              loading={loading}
            />
            <StatsRow 
              intl={intl}
              label={intl.formatMessage({
                id: "cases.stats.show.visits",
                defaultMessage: "Unique Visits"
              })}
              allTimeValue={statsData?.visits?.allTime || 0}
              customRangeValue={statsData?.visits?.customRange || 0}
              loading={loading}
            />
            <StatsRow 
              intl={intl}
              label={intl.formatMessage({
                id: "cases.stats.show.locales",
                defaultMessage: "Locales"
              })}
              allTimeValue={statsData?.locales?.allTime || 'N/A'}
              customRangeValue={statsData?.locales?.customRange || 'N/A'}
              loading={loading}
            />
            {statsData?.podcasts?.map(podcast => (
              <StatsRow 
                key={podcast.id}
                intl={intl}
                label=""
                allTimeValue={podcast.listens.allTime}
                customRangeValue={podcast.listens.customRange}
                loading={loading}
                isPodcast={true}
                podcastTitle={podcast.title}
              />
            ))}
          </tbody>
        </StatsTable>
        
        <DisclaimerSection intl={intl} />
      </StatsContainer>
    )
  }

  if (error) {
    return (
      <StatsContainer>
        <h1 className="admin__title">
          {intl.formatMessage({
            id: "cases.stats.show.case_stats",
            defaultMessage: "Case Stats"
          })}
        </h1>
        
        {/* Case Information Section */}
        <CaseInfoSection intl={intl} statsData={statsData} />
        
        <StatsTable>
          <StatsTableHeader intl={intl} dateRange={dateRange} isDatePickerOpen={isDatePickerOpen} setIsDatePickerOpen={setIsDatePickerOpen} handleDateRangeChange={handleDateRangeChange} formatDateRange={formatDateRange} shortcuts={shortcuts} statsData={statsData} />
          <tbody>
            <StatsRow 
              intl={intl}
              label={intl.formatMessage({
                id: "cases.stats.show.deployments",
                defaultMessage: "Deployments"
              })}
              allTimeValue={statsData?.deployments?.allTime || 0}
              customRangeValue={statsData?.deployments?.customRange || 0}
              loading={loading}
            />
            <StatsRow 
              intl={intl}
              label={intl.formatMessage({
                id: "cases.stats.show.visits",
                defaultMessage: "Unique Visits"
              })}
              allTimeValue={statsData?.visits?.allTime || 0}
              customRangeValue={statsData?.visits?.customRange || 0}
              loading={loading}
            />
            <StatsRow 
              intl={intl}
              label={intl.formatMessage({
                id: "cases.stats.show.locales",
                defaultMessage: "Locales"
              })}
              allTimeValue={statsData?.locales?.allTime || 'N/A'}
              customRangeValue={statsData?.locales?.customRange || 'N/A'}
              loading={loading}
            />
            {statsData?.podcasts?.map(podcast => (
              <StatsRow 
                key={podcast.id}
                intl={intl}
                label=""
                allTimeValue={podcast.listens.allTime}
                customRangeValue={podcast.listens.customRange}
                loading={loading}
                isPodcast={true}
                podcastTitle={podcast.title}
              />
            ))}
          </tbody>
        </StatsTable>
        
        {/* Error Message */}
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: '#ffebee', 
          borderRadius: '3px',
          border: '1px solid #ffcdd2',
          color: '#c62828'
        }}>
          <p style={{ margin: 0, fontSize: '14px' }}>
            {error}
          </p>
        </div>
        
        <DisclaimerSection intl={intl} />
      </StatsContainer>
    )
  }

  // If we have statsData, always show the table (even during loading)
  if (statsData) {
    return (
      <StatsContainer>
        <h1 className="admin__title">
          {intl.formatMessage({
            id: "cases.stats.show.case_stats",
            defaultMessage: "Case Stats"
          })}
        </h1>
        
        {/* Case Information Section */}
        <CaseInfoSection intl={intl} statsData={statsData} />
        
        <StatsTable>
          <StatsTableHeader intl={intl} dateRange={dateRange} isDatePickerOpen={isDatePickerOpen} setIsDatePickerOpen={setIsDatePickerOpen} handleDateRangeChange={handleDateRangeChange} formatDateRange={formatDateRange} shortcuts={shortcuts} statsData={statsData} />
          <tbody>
            <StatsRow 
              intl={intl}
              label={intl.formatMessage({
                id: "cases.stats.show.deployments",
                defaultMessage: "Deployments"
              })}
              allTimeValue={statsData.deployments.allTime}
              customRangeValue={statsData.deployments.customRange}
              loading={loading}
            />
            <StatsRow 
              intl={intl}
              label={intl.formatMessage({
                id: "cases.stats.show.visits",
                defaultMessage: "Unique Visits"
              })}
              allTimeValue={statsData.visits.allTime}
              customRangeValue={statsData.visits.customRange}
              loading={loading}
            />
            <StatsRow 
              intl={intl}
              label={intl.formatMessage({
                id: "cases.stats.show.locales",
                defaultMessage: "Locales"
              })}
              allTimeValue={statsData.locales.allTime}
              customRangeValue={statsData.locales.customRange}
              loading={loading}
            />
            {statsData.podcasts.map(podcast => (
              <StatsRow 
                key={podcast.id}
                intl={intl}
                label=""
                allTimeValue={podcast.listens.allTime}
                customRangeValue={podcast.listens.customRange}
                loading={loading}
                isPodcast={true}
                podcastTitle={podcast.title}
              />
            ))}
          </tbody>
        </StatsTable>
        
        <DisclaimerSection intl={intl} />
      </StatsContainer>
    )
  }

  // Only show the no data state if we don't have statsData
  return (
    <StatsContainer>
      <h1 className="admin__title">
        {intl.formatMessage({
          id: "cases.stats.show.case_stats",
          defaultMessage: "Case Stats"
        })}
      </h1>
      
      <StatsTable>
        <StatsTableHeader intl={intl} dateRange={dateRange} isDatePickerOpen={isDatePickerOpen} setIsDatePickerOpen={setIsDatePickerOpen} handleDateRangeChange={handleDateRangeChange} formatDateRange={formatDateRange} shortcuts={shortcuts} statsData={null} />
        <tbody>
          <tr>
            <td colSpan="3" style={{ textAlign: 'center', padding: '40px' }}>
              {intl.formatMessage({
                id: "cases.stats.show.no_data",
                defaultMessage: "No statistics available"
              })}
            </td>
          </tr>
        </tbody>
      </StatsTable>
      
      <DisclaimerSection intl={intl} />
    </StatsContainer>
  )
}

export default injectIntl(StatsPage) 