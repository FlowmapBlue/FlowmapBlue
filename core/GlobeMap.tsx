import {_GlobeView as GlobeView, Layer, MapViewState} from '@deck.gl/core';
import {MapLibreOverlay, MapLibreOverlayProps} from '@deck.gl/maplibre';
import {Colors} from '@blueprintjs/core';
import * as maplibregl from 'maplibre-gl';
import type {StyleSpecification} from 'maplibre-gl';
import React from 'react';
import {Map, useControl} from 'react-map-gl/maplibre';
import {MAX_GLOBE_ZOOM, MIN_ZOOM_LEVEL} from './FlowMap.state';

maplibregl.setWorkerUrl(new URL('maplibre-gl/dist/maplibre-gl-worker.mjs', import.meta.url).href);

function createUnlabeledGlobeStyle(color: string): StyleSpecification {
  return {
    version: 8,
    sources: {},
    layers: [{id: 'globe-background', type: 'background', paint: {'background-color': color}}],
  };
}

const darkGlobe = createUnlabeledGlobeStyle(Colors.DARK_GRAY3);
const lightGlobe = createUnlabeledGlobeStyle(Colors.LIGHT_GRAY3);
const globeView = new GlobeView({id: 'maplibre'});

function FlowOverlay({layers}: {layers: Layer[]}) {
  const overlay = useControl(
    () =>
      new MapLibreOverlay({
        interleaved: false,
        // Set the view before the style loads and MapLibre reports its projection.
        views: globeView as unknown as MapLibreOverlayProps['views'],
      }),
  );
  overlay.setProps({layers});
  return null;
}

interface Props {
  viewState: MapViewState;
  onMove: (event: {viewState: MapViewState}) => void;
  darkMode: boolean;
  baseMapEnabled: boolean;
  layers: Layer[];
}

export default function GlobeMap({viewState, onMove, darkMode, baseMapEnabled, layers}: Props) {
  return (
    <Map
      mapLib={maplibregl}
      longitude={viewState.longitude}
      latitude={viewState.latitude}
      zoom={viewState.zoom}
      bearing={0}
      pitch={0}
      minZoom={MIN_ZOOM_LEVEL}
      maxZoom={MAX_GLOBE_ZOOM}
      maxPitch={0}
      dragRotate={false}
      touchPitch={false}
      doubleClickZoom={false}
      projection="globe"
      mapStyle={
        baseMapEnabled
          ? `https://tiles.openfreemap.org/styles/${darkMode ? 'dark' : 'positron'}`
          : darkMode
          ? darkGlobe
          : lightGlobe
      }
      onMove={onMove}
    >
      <FlowOverlay layers={layers} />
    </Map>
  );
}
