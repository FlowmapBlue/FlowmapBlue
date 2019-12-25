import * as Cluster from '@flowmap.gl/cluster';

export enum ConfigPropName {
  TITLE = 'title',
  DESCRIPTION = 'description',
  AUTHOR_NAME = 'createdBy.name',
  AUTHOR_URL = 'createdBy.url',
  SOURCE_NAME = 'source.name',
  SOURCE_URL = 'source.url',
  MAP_BBOX = 'map.bbox',
  IGNORE_ERRORS = 'ignore.errors',
  MAPBOX_ACCESS_TOKEN = 'mapbox.accessToken',
  MAPBOX_MAP_STYLE = 'mapbox.mapStyle',
  COLORS_SCHEME = 'colors.scheme',
  COLORS_DARK_MODE = 'colors.darkMode',
  ANIMATE_FLOWS = 'animate.flows',
  FADE_AMOUNT = 'fadeAmount',
  CLUSTER_ON_ZOOM = 'clustering',
}

export interface ConfigProp {
  property: ConfigPropName;
  value: string | undefined;
}

export type Config = {
  [prop in ConfigPropName]: string | undefined;
};

export const getFlowMagnitude = (flow: Flow) => flow.count || 0;
export const getFlowOriginId = (flow: Flow) => flow.origin;
export const getFlowDestId = (flow: Flow) => flow.dest;
export const getLocationId = (loc: Location) => loc.id;

export const getLocationCentroid = (location: Location | Cluster.Cluster): [number, number] =>
  isLocationCluster(location) ? location.centroid : [location.lon, location.lat];

export interface Location {
  id: string;
  lon: number;
  lat: number;
  name: string;
}

export function isLocationCluster(l: Location | Cluster.Cluster): l is Cluster.Cluster {
  const { zoom } = l as Cluster.Cluster;
  return zoom !== undefined;
}

export interface Flow {
  origin: string;
  dest: string;
  count: number;
}
