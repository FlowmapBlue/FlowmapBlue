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
}

export interface ConfigProp {
  property: ConfigPropName
  value: string | undefined
}

export type Config = {
  [prop in ConfigPropName]: string | undefined
}

export interface Location {
  id: string
  lon: number
  lat: number
  name: string
}

export interface LocationCluster {
  id: string
  lon: number
  lat: number
  name: string
  leaves: Location[]
}

export interface Flow {
  origin: string
  dest: string
  count: number
}

export interface LocationSelection {
  id: string;
  direction: FlowDirection;
}

export enum FlowDirection {
  BOTH = 'BOTH',
  IN = 'IN',
  OUT = 'OUT',
}
