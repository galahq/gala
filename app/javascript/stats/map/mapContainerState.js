/*  */

import { DEFAULT_VIEWPORT } from './config'













function offscreenTooltipPosition () {
  return { left: -1000, top: -1000 }
}

function emptyMousePosition () {
  return { x: 0, y: 0 }
}

export function createInitialMapContainerState () {
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
  state,
  action
) {
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
