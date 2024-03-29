import {Config, ConfigPropName} from './types';

export const DEFAULT_MAP_STYLE_LIGHT = process.env.NEXT_PUBLIC_MapboxMapStyle_Light;
export const DEFAULT_MAP_STYLE_DARK = process.env.NEXT_PUBLIC_MapboxMapStyle_Dark;
export const DEFAULT_MAPBOX_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MapboxAccessToken;
export const DEFAULT_CONFIG: Config = {
  [ConfigPropName.MAPBOX_ACCESS_TOKEN]: DEFAULT_MAPBOX_ACCESS_TOKEN,
  'msg.locationTooltip.incoming': 'Incoming trips',
  'msg.locationTooltip.outgoing': 'Outgoing trips',
  'msg.locationTooltip.internal': 'Internal & round trips',
  'msg.flowTooltip.numOfTrips': 'Number of trips',
  'msg.totalCount.allTrips': '{0} trips',
  'msg.totalCount.countOfTrips': '{0} of {1} trips',
};

export function parseBoolConfigProp(value: string | undefined) {
  if (value != null) {
    const lower = value.toLowerCase();
    if (lower === 'yes' || lower === 'true' || lower === '1') return true;
  }
  return false;
}

export function parseNumberConfigProp(value: string | undefined, defaultValue: number) {
  if (value != null) {
    const numVal = +value;
    if (isFinite(numVal)) return numVal;
  }
  return defaultValue;
}
