/* @noflow */

import {
  normalizeStatsPayload,
  parseApiStatsPayload,
} from '../http/statsResponse'

describe('stats/http/statsResponse', () => {
  describe('parseApiStatsPayload', () => {
    it('throws for non-object payloads', () => {
      expect(() => parseApiStatsPayload(null)).toThrow('Invalid response')
      expect(() => parseApiStatsPayload('nope')).toThrow('Invalid response')
      expect(() => parseApiStatsPayload({})).toThrow('Invalid response')
    })

    it('returns payloads that contain a data array', () => {
      const payload = { data: [] }
      expect(parseApiStatsPayload(payload)).toEqual(payload)
    })
  })

  describe('normalizeStatsPayload', () => {
    it('normalizes country rows and builds summary totals', () => {
      const payload = {
        data: [
          {
            country: { iso2: 'US', iso3: 'USA', name: 'United States' },
            metrics: {
              unique_visits: '10',
              unique_users: '7',
              events_count: '12',
              visit_podcast_count: '3',
            },
            first_event: '2024-01-01T00:00:00Z',
            last_event: '2024-01-10T00:00:00Z',
          },
          {
            country: { iso2: ' ', iso3: null, name: ' ' },
            metrics: {
              unique_visits: null,
              unique_users: '2',
              events_count: 4,
              visit_podcast_count: '1',
            },
            first_event: '',
            last_event: null,
          },
        ],
      }

      const normalized = normalizeStatsPayload(payload)

      expect(normalized.formatted).toHaveLength(2)

      expect(normalized.formatted[0]).toMatchObject({
        iso2: 'US',
        iso3: 'USA',
        name: 'United States',
        unique_visits: 10,
        unique_users: 7,
        events_count: 12,
        visit_podcast_count: 3,
        first_event: '2024-01-01T00:00:00Z',
        last_event: '2024-01-10T00:00:00Z',
      })

      expect(normalized.formatted[1]).toMatchObject({
        iso2: null,
        iso3: null,
        name: 'Unknown',
        unique_visits: 0,
        unique_users: 2,
        events_count: 4,
        visit_podcast_count: 1,
        first_event: null,
        last_event: null,
      })

      expect(normalized.summary).toMatchObject({
        total_visits: 10,
        country_count: 2,
        total_podcast_listens: 4,
      })
      expect(normalized.summary.bins.length).toBeGreaterThan(0)
      expect(normalized.summary.bin_count).toEqual(normalized.summary.bins.length)
    })

    it('throws when backend sends an error payload', () => {
      expect(() => normalizeStatsPayload({ data: [], error: 'Nope' })).toThrow('Nope')
    })
  })
})
