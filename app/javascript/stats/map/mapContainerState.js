/* @flow */

import { DEFAULT_VIEWPORT } from './config'
import type { StatsCountryRow } from '../state/types'

export type MapViewport = {
  latitude: number,
  longitude: number,
  zoom: number,
}

export type MousePosition = {
  x: number,
  y: number,
}

export type TooltipPosition = {
  left: number,
  top: number,
}

export type MapContainerState = {
  lifecycle: {
    loaded: boolean,
    hasError: boolean,
    errorMessage: string,
  },
  interaction: {
    hoveredCountry: ?StatsCountryRow,
    mousePosition: MousePosition,
    tooltipPosition: TooltipPosition,
  },
  viewport: MapViewport,
}

type LifecycleLoadSucceededAction = {
  type: 'lifecycle/load_succeeded',
}

type LifecycleErrorSetAction = {
  type: 'lifecycle/error_set',
  message: string,
}

type LifecycleRetryRequestedAction = {
  type: 'lifecycle/retry_requested',
}

type InteractionHoverChangedAction = {
  type: 'interaction/hover_changed',
  country: ?StatsCountryRow,
  mousePosition: MousePosition,
}

type InteractionHoverClearedAction = {
  type: 'interaction/hover_cleared',
}

type InteractionTooltipPositionedAction = {
  type: 'interaction/tooltip_positioned',
  tooltipPosition: TooltipPosition,
}

type ViewportChangedAction = {
  type: 'viewport/changed',
  viewport: MapViewport,
}

export type MapContainerAction =
  | LifecycleLoadSucceededAction
  | LifecycleErrorSetAction
  | LifecycleRetryRequestedAction
  | InteractionHoverChangedAction
  | InteractionHoverClearedAction
  | InteractionTooltipPositionedAction
  | ViewportChangedAction

function offscreenTooltipPosition (): TooltipPosition {
  return { left: -1000, top: -1000 }
}

function emptyMousePosition (): MousePosition {
  return { x: 0, y: 0 }
}

export function createInitialMapContainerState (): MapContainerState {
  return {
    lifecycle: {
      loaded: false,
      hasError: false,
      errorMessage: '',
    },
    interaction: {
      hoveredCountry: null,
      mousePosition: emptyMousePosition(),
      tooltipPosition: offscreenTooltipPosition(),
    },
    viewport: DEFAULT_VIEWPORT,
  }
}

export function mapContainerReducer (
  state: MapContainerState,
  action: MapContainerAction
): MapContainerState {
  switch (action.type) {
    case 'lifecycle/load_succeeded':
      return {
        ...state,
        lifecycle: {
          loaded: true,
          hasError: false,
          errorMessage: '',
        },
      }

    case 'lifecycle/error_set':
      return {
        ...state,
        lifecycle: {
          loaded: false,
          hasError: true,
          errorMessage: action.message,
        },
      }

    case 'lifecycle/retry_requested':
      return {
        ...state,
        lifecycle: {
          loaded: false,
          hasError: false,
          errorMessage: '',
        },
        interaction: {
          ...state.interaction,
          hoveredCountry: null,
          mousePosition: emptyMousePosition(),
          tooltipPosition: offscreenTooltipPosition(),
        },
      }

    case 'interaction/hover_changed':
      return {
        ...state,
        interaction: {
          ...state.interaction,
          hoveredCountry: action.country,
          mousePosition: action.mousePosition,
        },
      }

    case 'interaction/hover_cleared':
      return {
        ...state,
        interaction: {
          ...state.interaction,
          hoveredCountry: null,
          mousePosition: emptyMousePosition(),
          tooltipPosition: offscreenTooltipPosition(),
        },
      }

    case 'interaction/tooltip_positioned':
      return {
        ...state,
        interaction: {
          ...state.interaction,
          tooltipPosition: action.tooltipPosition,
        },
      }

    case 'viewport/changed':
      return {
        ...state,
        viewport: action.viewport,
      }

    default:
      return state
  }
}
