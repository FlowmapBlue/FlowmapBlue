import { ViewportProps, ViewState } from 'react-map-gl';
import { Flow, FlowDirection, Location, LocationSelection } from './types';
import { Props as TooltipProps } from './Tooltip';

export const MIN_ZOOM_LEVEL = 1
export const MAX_ZOOM_LEVEL = 20

export enum HighlightType {
  LOCATION = 'location',
  FLOW = 'flow',
}

export interface LocationHighlight {
  type: HighlightType.LOCATION;
  locationId: string;
}

export interface FlowHighlight {
  type: HighlightType.FLOW;
  flow: Flow;
}

export type Highlight = LocationHighlight | FlowHighlight;


export interface State {
  viewState: ViewState | ViewportProps
  lastLocations: Location[] | undefined
  tooltip?: TooltipProps
  highlight?: Highlight
  selectedLocations: LocationSelection[] | undefined,
  animationEnabled: boolean
  clusteringEnabled: boolean
  darkMode: boolean
  fadeAmount: number
  colorSchemeKey: string | undefined
}


export enum ActionType {
  SET_VIEW_STATE = 'SET_VIEW_STATE',
  ZOOM_IN = 'ZOOM_IN',
  ZOOM_OUT = 'ZOOM_OUT',
  SET_HIGHLIGHT = 'SET_HIGHLIGHT',
  SET_TOOLTIP = 'SET_TOOLTIP',
  CLEAR_SELECTION = 'CLEAR_SELECTION',
  SELECT_LOCATION = 'SELECT_LOCATION',
  SET_SELECTED_LOCATIONS = 'SET_SELECTED_LOCATIONS',
  SET_CLUSTERING_ENABLED = 'SET_CLUSTERING_ENABLED',
  SET_ANIMATION_ENABLED = 'SET_ANIMATION_ENABLED',
  SET_DARK_MODE = 'SET_DARK_MODE',
  SET_FADE_AMOUNT = 'SET_FADE_AMOUNT',
  SET_COLOR_SCHEME = 'SET_COLOR_SCHEME',
}

export type Action = {
  type: ActionType.SET_VIEW_STATE
  viewState: ViewState | ViewportProps
  lastLocations?: Location[]
} | {
  type: ActionType.ZOOM_IN
} | {
  type: ActionType.ZOOM_OUT
} | {
  type: ActionType.SET_HIGHLIGHT
  highlight: Highlight | undefined
} | {
  type: ActionType.CLEAR_SELECTION
} | {
  type: ActionType.SELECT_LOCATION
  locationId: string
  incremental: boolean
} | {
  type: ActionType.SET_SELECTED_LOCATIONS
  selectedLocations: LocationSelection[] | undefined
} | {
  type: ActionType.SET_TOOLTIP
  tooltip: TooltipProps | undefined
} | {
  type: ActionType.SET_CLUSTERING_ENABLED
  clusteringEnabled: boolean
} | {
  type: ActionType.SET_ANIMATION_ENABLED
  animationEnabled: boolean
} | {
  type: ActionType.SET_DARK_MODE
  darkMode: boolean
} | {
  type: ActionType.SET_FADE_AMOUNT
  fadeAmount: number
} | {
  type: ActionType.SET_COLOR_SCHEME
  colorSchemeKey: string
}


export function reducer(state: State, action: Action) {
  switch (action.type) {
    case ActionType.SET_VIEW_STATE: {
      const { viewState, lastLocations } = action
      return {
        ...state,
        viewState: {
          ...viewState,
          zoom: Math.min(
            MAX_ZOOM_LEVEL,
            Math.max(MIN_ZOOM_LEVEL, viewState.zoom),
          )
        },
        ...(lastLocations !== undefined && {
          lastLocations: lastLocations,
        }),
        tooltip: undefined,
        highlight: undefined,
      }
    }
    case ActionType.ZOOM_IN: {
      const { viewState } = state
      return {
        ...state,
        viewState: {
          ...viewState,
          zoom: Math.min(
            MAX_ZOOM_LEVEL,
            viewState.zoom * 1.1
          ),
        },
        tooltip: undefined,
        highlight: undefined,
      }
    }
    case ActionType.ZOOM_OUT: {
      const { viewState } = state
      return {
        ...state,
        viewState: {
          ...viewState,
          zoom: Math.max(
            MIN_ZOOM_LEVEL,
            viewState.zoom / 1.1
          ),
        },
        tooltip: undefined,
        highlight: undefined,
      }
    }
    case ActionType.SET_HIGHLIGHT: {
      const { highlight } = action
      return {
        ...state,
        highlight,
      }
    }
    case ActionType.SET_TOOLTIP: {
      const { tooltip } = action
      return {
        ...state,
        tooltip,
      }
    }
    case ActionType.CLEAR_SELECTION: {
      return {
        ...state,
        selectedLocations: undefined,
        highlight: undefined,
        tooltip: undefined,
      }
    }
    case ActionType.SET_SELECTED_LOCATIONS: {
      const { selectedLocations } = action
      return {
        ...state,
        selectedLocations,
      }
    }
    case ActionType.SELECT_LOCATION: {
      const { selectedLocations } = state
      const { locationId, incremental } = action
      let nextSelectedLocations
      if (selectedLocations) {
        const idx = selectedLocations.findIndex(s => s.id === locationId)
        if (idx >= 0) {
          nextSelectedLocations = selectedLocations.slice()
          nextSelectedLocations.splice(idx, 1)
          if (nextSelectedLocations.length === 0) nextSelectedLocations = undefined
        } else {
          if (incremental) {
            nextSelectedLocations = [...selectedLocations, { id: locationId, direction: FlowDirection.BOTH }]
          } else {
            nextSelectedLocations = [{ id: locationId, direction: FlowDirection.BOTH }]
          }
        }
      } else {
        nextSelectedLocations = [{ id: locationId, direction: FlowDirection.BOTH }]
      }
      return {
        ...state,
        selectedLocations: nextSelectedLocations,
        highlight: undefined,
        tooltip: undefined,
      }
    }
    case ActionType.SET_CLUSTERING_ENABLED: {
      const { clusteringEnabled } = action
      return {
        ...state,
        clusteringEnabled,
      }
    }
    case ActionType.SET_ANIMATION_ENABLED: {
      const { animationEnabled } = action
      return {
        ...state,
        animationEnabled,
      }
    }
    case ActionType.SET_DARK_MODE: {
      const { darkMode } = action
      return {
        ...state,
        darkMode,
      }
    }
    case ActionType.SET_FADE_AMOUNT: {
      const { fadeAmount } = action
      return {
        ...state,
        fadeAmount,
      }
    }
    case ActionType.SET_COLOR_SCHEME: {
      const { colorSchemeKey } = action
      return {
        ...state,
        colorSchemeKey,
      }
    }
  }
  return state;
}
