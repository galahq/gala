/* @noflow */

import {
  applyCountryFillColor,
  applyMapLoadPresentation,
  getMapInstance,
} from '../map/mapEngine'
import {
  createInitialMapContainerState,
  mapContainerReducer,
} from '../map/mapContainerState'

const sampleCountry = {
  iso2: 'US',
  iso3: 'USA',
  name: 'United States',
  unique_visits: 10,
  unique_users: 8,
  events_count: 12,
  visit_podcast_count: 4,
  first_event: '2024-01-01T00:00:00Z',
  last_event: '2024-01-10T00:00:00Z',
  bin: 0,
}

describe('stats/map/mapContainerState', () => {
  it('creates initial reducer state with expected slices', () => {
    const state = createInitialMapContainerState()

    expect(state.lifecycle).toEqual({
      loaded: false,
      hasError: false,
      errorMessage: '',
    })
    expect(state.interaction.hoveredCountry).toBeNull()
    expect(state.interaction.mousePosition).toEqual({ x: 0, y: 0 })
    expect(state.interaction.tooltipPosition).toEqual({ left: -1000, top: -1000 })
    expect(state.viewport).toMatchObject({
      latitude: expect.any(Number),
      longitude: expect.any(Number),
      zoom: expect.any(Number),
    })
  })

  it('handles lifecycle transitions', () => {
    const initial = createInitialMapContainerState()

    const errored = mapContainerReducer(initial, {
      type: 'lifecycle/error_set',
      message: 'map failed',
    })

    expect(errored.lifecycle).toEqual({
      loaded: false,
      hasError: true,
      errorMessage: 'map failed',
    })

    const loaded = mapContainerReducer(errored, { type: 'lifecycle/load_succeeded' })
    expect(loaded.lifecycle).toEqual({
      loaded: true,
      hasError: false,
      errorMessage: '',
    })

    const retried = mapContainerReducer(loaded, { type: 'lifecycle/retry_requested' })
    expect(retried.lifecycle).toEqual({
      loaded: false,
      hasError: false,
      errorMessage: '',
    })
  })

  it('handles interaction and viewport transitions', () => {
    const initial = createInitialMapContainerState()

    const hovered = mapContainerReducer(initial, {
      type: 'interaction/hover_changed',
      country: sampleCountry,
      mousePosition: { x: 12, y: 34 },
    })

    expect(hovered.interaction.hoveredCountry).toEqual(sampleCountry)
    expect(hovered.interaction.mousePosition).toEqual({ x: 12, y: 34 })

    const positioned = mapContainerReducer(hovered, {
      type: 'interaction/tooltip_positioned',
      tooltipPosition: { left: 100, top: 200 },
    })
    expect(positioned.interaction.tooltipPosition).toEqual({ left: 100, top: 200 })

    const cleared = mapContainerReducer(positioned, {
      type: 'interaction/hover_cleared',
    })
    expect(cleared.interaction.hoveredCountry).toBeNull()
    expect(cleared.interaction.mousePosition).toEqual({ x: 0, y: 0 })
    expect(cleared.interaction.tooltipPosition).toEqual({ left: -1000, top: -1000 })

    const movedViewport = mapContainerReducer(cleared, {
      type: 'viewport/changed',
      viewport: { latitude: 30, longitude: 40, zoom: 2 },
    })
    expect(movedViewport.viewport).toEqual({ latitude: 30, longitude: 40, zoom: 2 })
  })
})

describe('stats/map/mapEngine', () => {
  it('resolves map instances from refs', () => {
    expect(getMapInstance({ current: null })).toBeNull()

    const map = { id: 'map' }
    expect(getMapInstance({
      current: {
        getMap: () => map,
      },
    })).toBe(map)
  })

  it('applies fill color only when target layer exists', () => {
    const mapWithLayer = {
      getLayer: jest.fn().mockReturnValue({ id: 'country-fills' }),
      setPaintProperty: jest.fn(),
    }
    const expression = ['match', ['get', 'iso_3166_1_alpha_3'], 'USA', '#fff', '#000']

    applyCountryFillColor(mapWithLayer, expression, '#123456')

    expect(mapWithLayer.setPaintProperty).toHaveBeenCalledWith(
      'country-fills',
      'fill-color',
      expression
    )

    const mapWithoutLayer = {
      getLayer: jest.fn().mockReturnValue(null),
      setPaintProperty: jest.fn(),
    }

    applyCountryFillColor(mapWithoutLayer, expression, '#123456')
    expect(mapWithoutLayer.setPaintProperty).not.toHaveBeenCalled()
  })

  it('applies map load presentation tweaks', () => {
    const logo = { style: {}}
    const map = {
      getStyle: jest.fn(() => ({
        layers: [
          { id: 'symbol-1', type: 'symbol' },
          { id: 'fill-1', type: 'fill' },
        ],
      })),
      setLayoutProperty: jest.fn(),
      getContainer: jest.fn(() => ({
        querySelector: jest.fn(() => logo),
      })),
    }

    applyMapLoadPresentation(map)

    expect(map.setLayoutProperty).toHaveBeenCalledWith('symbol-1', 'visibility', 'none')
    expect(map.setLayoutProperty).toHaveBeenCalledTimes(1)
    expect(logo.style.opacity).toEqual('0.2')
    expect(logo.style.filter).toEqual('brightness(0.3)')
  })
})
