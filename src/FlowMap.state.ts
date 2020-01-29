import { ViewportProps } from 'react-map-gl';
import { Config, ConfigPropName, Flow } from './types';
import { Props as TooltipProps } from './Tooltip';
import * as queryString from 'query-string';
import { viewport } from '@mapbox/geo-viewport';
import { parseBoolConfigProp, parseNumberConfigProp } from './config';
import { COLOR_SCHEME_KEYS } from './colors';
import { csvFormatRows, csvParseRows } from 'd3-dsv';
import { Reducer } from 'react';

export const MIN_ZOOM_LEVEL = 1;
export const MAX_ZOOM_LEVEL = 20;

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
  viewport: ViewportProps;
  adjustViewportToLocations: boolean;
  tooltip?: TooltipProps;
  highlight?: Highlight;
  selectedLocations: string[] | undefined;
  animationEnabled: boolean;
  locationTotalsEnabled: boolean;
  clusteringEnabled: boolean;
  baseMapEnabled: boolean;
  darkMode: boolean;
  fadeAmount: number;
  baseMapOpacity: number;
  colorSchemeKey: string | undefined;
}

export enum ActionType {
  SET_VIEWPORT = 'SET_VIEWPORT',
  ZOOM_IN = 'ZOOM_IN',
  ZOOM_OUT = 'ZOOM_OUT',
  SET_HIGHLIGHT = 'SET_HIGHLIGHT',
  SET_TOOLTIP = 'SET_TOOLTIP',
  CLEAR_SELECTION = 'CLEAR_SELECTION',
  SELECT_LOCATION = 'SELECT_LOCATION',
  SET_SELECTED_LOCATIONS = 'SET_SELECTED_LOCATIONS',
  SET_CLUSTERING_ENABLED = 'SET_CLUSTERING_ENABLED',
  SET_ANIMATION_ENABLED = 'SET_ANIMATION_ENABLED',
  SET_LOCATION_TOTALS_ENABLED = 'SET_LOCATION_TOTALS_ENABLED',
  SET_DARK_MODE = 'SET_DARK_MODE',
  SET_BASE_MAP_ENABLED = 'SET_BASE_MAP_ENABLED',
  SET_FADE_AMOUNT = 'SET_FADE_AMOUNT',
  SET_BASE_MAP_OPACITY = 'SET_BASE_MAP_OPACITY',
  SET_COLOR_SCHEME = 'SET_COLOR_SCHEME',
}

export type Action =
  | {
      type: ActionType.SET_VIEWPORT;
      viewport: ViewportProps;
    }
  | {
      type: ActionType.ZOOM_IN;
    }
  | {
      type: ActionType.ZOOM_OUT;
    }
  | {
      type: ActionType.SET_HIGHLIGHT;
      highlight: Highlight | undefined;
    }
  | {
      type: ActionType.CLEAR_SELECTION;
    }
  | {
      type: ActionType.SELECT_LOCATION;
      locationId: string;
      incremental: boolean;
    }
  | {
      type: ActionType.SET_SELECTED_LOCATIONS;
      selectedLocations: string[] | undefined;
    }
  | {
      type: ActionType.SET_TOOLTIP;
      tooltip: TooltipProps | undefined;
    }
  | {
      type: ActionType.SET_CLUSTERING_ENABLED;
      clusteringEnabled: boolean;
    }
  | {
      type: ActionType.SET_ANIMATION_ENABLED;
      animationEnabled: boolean;
    }
  | {
      type: ActionType.SET_LOCATION_TOTALS_ENABLED;
      locationTotalsEnabled: boolean;
    }
  | {
      type: ActionType.SET_DARK_MODE;
      darkMode: boolean;
    }
  | {
      type: ActionType.SET_BASE_MAP_ENABLED;
      baseMapEnabled: boolean;
    }
  | {
      type: ActionType.SET_FADE_AMOUNT;
      fadeAmount: number;
    }
  | {
      type: ActionType.SET_BASE_MAP_OPACITY;
      baseMapOpacity: number;
    }
  | {
      type: ActionType.SET_COLOR_SCHEME;
      colorSchemeKey: string;
    };

function mainReducer(state: State, action: Action): State {
  switch (action.type) {
    case ActionType.SET_VIEWPORT: {
      const { viewport } = action;
      return {
        ...state,
        viewport: {
          ...viewport,
          zoom: Math.min(MAX_ZOOM_LEVEL, Math.max(MIN_ZOOM_LEVEL, viewport.zoom)),
        },
        tooltip: undefined,
        highlight: undefined,
      };
    }
    case ActionType.ZOOM_IN: {
      const { viewport } = state;
      return {
        ...state,
        viewport: {
          ...viewport,
          zoom: Math.min(MAX_ZOOM_LEVEL, viewport.zoom * 1.1),
        },
        tooltip: undefined,
        highlight: undefined,
      };
    }
    case ActionType.ZOOM_OUT: {
      const { viewport } = state;
      return {
        ...state,
        viewport: {
          ...viewport,
          zoom: Math.max(MIN_ZOOM_LEVEL, viewport.zoom / 1.1),
        },
        tooltip: undefined,
        highlight: undefined,
      };
    }
    case ActionType.SET_HIGHLIGHT: {
      const { highlight } = action;
      return {
        ...state,
        highlight,
      };
    }
    case ActionType.SET_TOOLTIP: {
      const { tooltip } = action;
      return {
        ...state,
        tooltip,
      };
    }
    case ActionType.CLEAR_SELECTION: {
      return {
        ...state,
        selectedLocations: undefined,
        highlight: undefined,
        tooltip: undefined,
      };
    }
    case ActionType.SET_SELECTED_LOCATIONS: {
      const { selectedLocations } = action;
      return {
        ...state,
        selectedLocations,
      };
    }
    case ActionType.SELECT_LOCATION: {
      const { selectedLocations } = state;
      const { locationId, incremental } = action;
      let nextSelectedLocations;
      if (selectedLocations) {
        const idx = selectedLocations.findIndex(id => id === locationId);
        if (idx >= 0) {
          nextSelectedLocations = selectedLocations.slice();
          nextSelectedLocations.splice(idx, 1);
          if (nextSelectedLocations.length === 0) nextSelectedLocations = undefined;
        } else {
          if (incremental) {
            nextSelectedLocations = [...selectedLocations, locationId];
          } else {
            nextSelectedLocations = [locationId];
          }
        }
      } else {
        nextSelectedLocations = [locationId];
      }
      return {
        ...state,
        selectedLocations: nextSelectedLocations,
        highlight: undefined,
        tooltip: undefined,
      };
    }
    case ActionType.SET_CLUSTERING_ENABLED: {
      const { clusteringEnabled } = action;
      return {
        ...state,
        clusteringEnabled,
      };
    }
    case ActionType.SET_ANIMATION_ENABLED: {
      const { animationEnabled } = action;
      return {
        ...state,
        animationEnabled,
      };
    }
    case ActionType.SET_LOCATION_TOTALS_ENABLED: {
      const { locationTotalsEnabled } = action;
      return {
        ...state,
        locationTotalsEnabled,
      };
    }
    case ActionType.SET_DARK_MODE: {
      const { darkMode } = action;
      return {
        ...state,
        darkMode,
      };
    }
    case ActionType.SET_BASE_MAP_ENABLED: {
      const { baseMapEnabled } = action;
      return {
        ...state,
        baseMapEnabled,
      };
    }
    case ActionType.SET_FADE_AMOUNT: {
      const { fadeAmount } = action;
      return {
        ...state,
        fadeAmount,
      };
    }
    case ActionType.SET_BASE_MAP_OPACITY: {
      const { baseMapOpacity } = action;
      return {
        ...state,
        baseMapOpacity,
      };
    }
    case ActionType.SET_COLOR_SCHEME: {
      const { colorSchemeKey } = action;
      return {
        ...state,
        colorSchemeKey,
      };
    }
  }
  return state;
}

export const reducer: Reducer<State, Action> = (state: State, action: Action) => {
  const nextState = mainReducer(state, action);
  //console.log(type, rest);
  return nextState;
};

export function asNumber(v: string | string[] | null | undefined): number | undefined {
  if (typeof v === 'string') {
    const val = +v;
    if (!isNaN(val) && isFinite(val)) return val;
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
  const draft = { ...initialState };
  const params = queryString.parse(query.substr(1));
  if (typeof params.s === 'string') {
    const rows = csvParseRows(params.s);
    if (rows.length > 0) {
      draft.selectedLocations = rows[0];
    }
  }
  if (typeof params.v === 'string') {
    const rows = csvParseRows(params.v);
    if (rows.length > 0) {
      const [latitude, longitude, zoom] = rows[0].map(asNumber);
      if (latitude != null && longitude != null && zoom != null) {
        draft.viewport = {
          ...draft.viewport,
          latitude,
          longitude,
          zoom,
        };
        draft.adjustViewportToLocations = false;
      }
    }
  }
  draft.fadeAmount = asNumber(params.f) ?? draft.fadeAmount;
  draft.baseMapOpacity = asNumber(params.bo) ?? draft.baseMapOpacity;
  draft.baseMapEnabled = asBoolean(params.b) ?? draft.baseMapEnabled;
  draft.darkMode = asBoolean(params.d) ?? draft.darkMode;
  draft.animationEnabled = asBoolean(params.a) ?? draft.animationEnabled;
  draft.clusteringEnabled = asBoolean(params.c) ?? draft.clusteringEnabled;
  draft.locationTotalsEnabled = asBoolean(params.lt) ?? draft.locationTotalsEnabled;
  if (typeof params.col === 'string' && COLOR_SCHEME_KEYS.includes(params.col)) {
    draft.colorSchemeKey = params.col;
  }
  return draft;
}

export function stateToQueryString(state: State) {
  const parts: string[] = [];
  const {
    viewport: { latitude, longitude, zoom },
    selectedLocations,
  } = state;
  parts.push(`v=${csvFormatRows([[latitude.toFixed(6), longitude.toFixed(6), zoom.toFixed(2)]])}`);
  parts.push(`a=${state.animationEnabled ? 1 : 0}`);
  parts.push(`b=${state.baseMapEnabled ? 1 : 0}`);
  parts.push(`bo=${state.baseMapOpacity}`);
  parts.push(`c=${state.clusteringEnabled ? 1 : 0}`);
  parts.push(`d=${state.darkMode ? 1 : 0}`);
  parts.push(`lt=${state.locationTotalsEnabled ? 1 : 0}`);
  if (state.colorSchemeKey != null) {
    parts.push(`col=${state.colorSchemeKey}`);
  }
  parts.push(`f=${state.fadeAmount}`);
  if (selectedLocations) {
    parts.push(`s=${encodeURIComponent(csvFormatRows([selectedLocations]))}`);
  }
  return parts.join('&');
}

export function getInitialViewport(bbox: [number, number, number, number]) {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const {
    center: [longitude, latitude],
    zoom,
  } = viewport(bbox, [width, height], undefined, undefined, 512, true);
  return {
    width,
    height,
    longitude,
    latitude,
    zoom,
    minZoom: MIN_ZOOM_LEVEL,
    maxZoom: MAX_ZOOM_LEVEL,
    minPitch: 0,
    maxPitch: 0,
    bearing: 0,
    pitch: 0,
    altitude: 1.5,
  };
}

export const DEFAULT_VIEWPORT = getInitialViewport([-180, -70, 180, 70]);

export function getInitialState(config: Config, queryString: string) {
  const draft = {
    viewport: DEFAULT_VIEWPORT,
    adjustViewportToLocations: true,
    selectedLocations: undefined,
    locationTotalsEnabled: true,
    baseMapEnabled: true,
    animationEnabled: parseBoolConfigProp(config[ConfigPropName.ANIMATE_FLOWS]),
    clusteringEnabled: parseBoolConfigProp(config[ConfigPropName.CLUSTER_ON_ZOOM] || 'true'),
    darkMode: parseBoolConfigProp(config[ConfigPropName.COLORS_DARK_MODE] || 'true'),
    fadeAmount: parseNumberConfigProp(config[ConfigPropName.FADE_AMOUNT], 45),
    baseMapOpacity: parseNumberConfigProp(config[ConfigPropName.BASE_MAP_OPACITY], 50),
    colorSchemeKey: config[ConfigPropName.COLORS_SCHEME],
  };

  const bbox = config[ConfigPropName.MAP_BBOX];
  if (bbox) {
    const bounds = bbox
      .split(',')
      .map(asNumber)
      .filter(v => v != null) as number[];
    if (bounds.length === 4) {
      draft.viewport = getInitialViewport(bounds as [number, number, number, number]);
      draft.adjustViewportToLocations = false;
    }
  }

  if (queryString && queryString.length > 1) {
    return applyStateFromQueryString(draft, queryString);
  }
  return draft;
}
