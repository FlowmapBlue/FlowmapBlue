import { Config, ConfigPropName } from './types';

export const DEFAULT_MAP_STYLE_LIGHT = 'mapbox://styles/mapbox/light-v10';
export const DEFAULT_MAP_STYLE_DARK = 'mapbox://styles/mapbox/dark-v10';
export const DEFAULT_CONFIG: Config = {
  [ConfigPropName.MAPBOX_ACCESS_TOKEN]: process.env.REACT_APP_MapboxAccessToken,
  [ConfigPropName.TITLE]: undefined,
  [ConfigPropName.AUTHOR_NAME]: undefined,
  [ConfigPropName.AUTHOR_URL]: undefined,
  [ConfigPropName.SOURCE_NAME]: undefined,
  [ConfigPropName.SOURCE_URL]: undefined,
  [ConfigPropName.DESCRIPTION]: undefined,
  [ConfigPropName.MAP_BBOX]: undefined,
  [ConfigPropName.MAPBOX_MAP_STYLE]: undefined,
  [ConfigPropName.IGNORE_ERRORS]: undefined,
  [ConfigPropName.COLORS_SCHEME]: undefined,
  [ConfigPropName.COLORS_DARK_MODE]: undefined,
  [ConfigPropName.ANIMATE_FLOWS]: undefined,
  [ConfigPropName.CLUSTER_ON_ZOOM]: undefined,
  [ConfigPropName.FADE_AMOUNT]: undefined,
  [ConfigPropName.BASE_MAP_OPACITY]: undefined,
  [ConfigPropName.FLOWS_SHEETS]: undefined,
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
