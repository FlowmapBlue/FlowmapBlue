import { ViewportProps, ViewState } from 'react-map-gl';
import { Config, ConfigPropName, Flow, FlowDirection, LocationSelection } from './types';
import { Props as TooltipProps } from './Tooltip';
import * as queryString from 'query-string';
import { viewport } from '@mapbox/geo-viewport';
import { parseBoolConfigProp, parseNumberConfigProp } from './config';
import { COLOR_SCHEMES } from './colors';
import { csvFormatRows, csvParseRows } from 'd3-dsv';

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
  adjustViewportToLocations: boolean
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


function mainReducer(state: State, action: Action) {
  switch (action.type) {
    case ActionType.SET_VIEW_STATE: {
      const { viewState } = action
      return {
        ...state,
        viewState: {
          ...viewState,
          zoom: Math.min(
            MAX_ZOOM_LEVEL,
            Math.max(MIN_ZOOM_LEVEL, viewState.zoom),
          )
        },
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

export const reducer = (state: State, action: Action) => {
  const nextState = mainReducer(state, action);
  //console.log(type, rest);
  return nextState;
}

export function asNumber(v: string | string[] | null | undefined): number | undefined {
  if (typeof v === 'string') {
    const val = +v
    if (!isNaN(val) && isFinite(val)) return val
  }
  return undefined;
}

export function asBoolean(v: string | string[] | null | undefined): boolean | undefined {
  if (v === '1' || v === '0') {
    return v === '1';
  }
  return undefined;
}

export function applyStateFromQueryString(initialState: State, query: string) {
  const draft = { ...initialState }
  const params = queryString.parse(query.substr(1))
  if (typeof params.s === 'string') {
    const rows = csvParseRows(params.s);
    if (rows.length > 0) {
      draft.selectedLocations = rows[0].map(id => ({
        id,
        direction: FlowDirection.BOTH,
      }))
    }
  }
  if (typeof params.v === 'string') {
    const rows = csvParseRows(params.v);
    if (rows.length > 0) {
      const [ latitude, longitude, zoom ] = rows[0].map(asNumber);
      if (latitude != null && longitude != null && zoom != null) {
        draft.viewState = {
          ...draft.viewState,
          latitude,
          longitude,
          zoom,
        }
        draft.adjustViewportToLocations = false;
      }
    }
  }
  draft.fadeAmount = asNumber(params.f) ?? draft.fadeAmount
  draft.darkMode = asBoolean(params.d) ?? draft.darkMode
  draft.animationEnabled = asBoolean(params.a) ?? draft.animationEnabled
  draft.clusteringEnabled = asBoolean(params.c) ?? draft.clusteringEnabled
  if (typeof params.col === 'string' &&
    Object.keys(COLOR_SCHEMES).includes(params.col))
  {
    draft.colorSchemeKey = params.col
  }
  return draft
}

export function stateToQueryString(state: State) {
  const parts: string[] = []
  const {
    viewState: { latitude, longitude, zoom },
    selectedLocations,
  } = state
  parts.push(
    `v=${csvFormatRows([[
      latitude.toFixed(6),
      longitude.toFixed(6),
      zoom.toFixed(2),
    ]])}`
  )
  parts.push(`a=${state.animationEnabled ? 1 : 0}`)
  parts.push(`d=${state.darkMode ? 1 : 0}`)
  parts.push(`c=${state.clusteringEnabled ? 1 : 0}`)
  if (state.colorSchemeKey != null) {
    parts.push(`col=${state.colorSchemeKey}`)
  }
  parts.push(`f=${state.fadeAmount}`)
  if (selectedLocations) {
    parts.push(
      `s=${csvFormatRows([
        selectedLocations.map(({ id }) => id)
      ])}`
    )
  }
  return parts.join('&')
}

export function getInitialViewState(bbox: [number, number, number, number]) {
  const {center: [longitude, latitude], zoom} =
    viewport(
      bbox,
      [window.innerWidth, window.innerHeight],
      undefined, undefined, 512, true
    )
  return {
    longitude,
    latitude,
    zoom,
    bearing: 0,
    pitch: 0,
  }
}

export const DEFAULT_VIEW_STATE = getInitialViewState([-180, -70, 180, 70]);

export function getInitialState(config: Config, queryString: string) {
  const draft = {
    viewState: DEFAULT_VIEW_STATE,
    adjustViewportToLocations: true,
    selectedLocations: undefined,
    animationEnabled: parseBoolConfigProp(config[ConfigPropName.ANIMATE_FLOWS]),
    clusteringEnabled: parseBoolConfigProp(config[ConfigPropName.CLUSTER_ON_ZOOM] || 'true'),
    darkMode: parseBoolConfigProp(config[ConfigPropName.COLORS_DARK_MODE] || 'true'),
    fadeAmount: parseNumberConfigProp(config[ConfigPropName.FADE_AMOUNT], 45),
    colorSchemeKey: config[ConfigPropName.COLORS_SCHEME],
  };

  const bbox = config[ConfigPropName.MAP_BBOX]
  if (bbox) {
    const bounds = bbox
      .split(',')
      .map(asNumber)
      .filter(v => v != null) as number[]
    if (bounds.length === 4) {
      draft.viewState = getInitialViewState(bounds as [number, number, number, number])
      draft.adjustViewportToLocations = false;
    }
  }

  if (queryString && queryString.length > 1) {
    return applyStateFromQueryString(draft, queryString);
  }
  return draft;
}
