import { BoundingBox, viewport } from '@mapbox/geo-viewport';
import { geoBounds } from 'd3-geo';
import { FeatureCollection, GeometryCollection, GeometryObject } from 'geojson';
import { ViewState } from 'react-map-gl';
import { LocationProperties } from '@flowmap.gl/core';

export type Options = {
  pad?: number;
  tileSize?: number;
  minZoom?: number;
  maxZoom?: number;
  allowFloat?: boolean;
}

export const fitFeaturesInView = (
  featureCollection: FeatureCollection<GeometryObject, LocationProperties> | GeometryCollection,
  size: [number, number],
  opts?: Options,
): ViewState => {
  const { pad = 0, tileSize = 512, minZoom = 0, maxZoom = 100, allowFloat = true } = opts || {};
  const [[x1, y1], [x2, y2]] = geoBounds(featureCollection as any);
  const bounds: BoundingBox = [x1 - pad * (x2 - x1), y1 - pad * (y2 - y1), x2 + pad * (x2 - x1), y2 + pad * (y2 - y1)];

  const {
    center: [longitude, latitude],
    zoom,
  } =
    // @ts-ignore
    viewport(bounds, size, undefined, undefined, tileSize, allowFloat);
  return {
    longitude,
    latitude,
    zoom: Math.max(Math.min(maxZoom, zoom), minZoom),
  };
};

export const fitLocationsInView = (
  locations: Array<any>,
  getLocationCentroid: (location: any) => [number, number],
  size: [number, number],
  opts?: Options,
): ViewState =>
  fitFeaturesInView(
    {
      type: 'GeometryCollection',
      geometries: locations.map(location => ({
        type: 'Point',
        coordinates: getLocationCentroid(location),
      })),
    } as any,
    size,
    opts,
  );

export const getInitialViewState = (bbox: [number, number, number, number]) => {
  const { center: [longitude, latitude], zoom } =
    viewport(
      bbox,
      [window.innerWidth, window.innerHeight],
      undefined, undefined, 512
    )
  return {
    longitude,
    latitude,
    zoom,
    bearing: 0,
    pitch: 0,
  }
}
