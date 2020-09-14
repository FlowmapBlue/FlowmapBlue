import React, { useCallback, useEffect } from 'react';
import { Editor, DrawPolygonMode, RENDER_STATE } from 'react-map-gl-draw';
import { Colors } from '@blueprintjs/core';
import { Feature, Polygon } from 'geojson';

export enum MapDrawingMode {
  POLYGON = 'POLYGON',
}

export type MapDrawingFeature = Feature<
  Polygon,
  {
    renderType: 'Polygon' | 'Rectangle';
    bbox: { xmin: number; xmax: number; ymin: number; ymax: number };
    isClosed?: boolean;
  }
>;

export interface Props {
  mapDrawingMode: MapDrawingMode;
  onFeatureDrawn: (feature: MapDrawingFeature | undefined) => void;
}

export const HANDLE_RADIUS = 5;
export const HANDLE_STROKE = {
  DEFAULT: Colors.WHITE,
  [RENDER_STATE.SELECTED]: Colors.BLUE3,
  [RENDER_STATE.HOVERED]: Colors.VERMILION3,
};
export const HANDLE_FILL = {
  DEFAULT: Colors.WHITE,
  [RENDER_STATE.SELECTED]: Colors.BLUE3,
  [RENDER_STATE.HOVERED]: Colors.BLUE5,
  [RENDER_STATE.INACTIVE]: Colors.GRAY2,
  [RENDER_STATE.UNCOMMITTED]: Colors.GRAY2,
};

function getEditHandleStyle({ feature, state }: any) {
  return {
    stroke: HANDLE_STROKE[state] || HANDLE_STROKE.DEFAULT,
    strokeWidth: 2,
    fill: HANDLE_FILL[state] || HANDLE_FILL.DEFAULT,
    fillOpacity: 1.0,
    r: HANDLE_RADIUS,
  };
}

export const FEATURE_STROKE = {
  DEFAULT: Colors.ORANGE5,
  [RENDER_STATE.INACTIVE]: Colors.ORANGE5,
  [RENDER_STATE.UNCOMMITTED]: Colors.ORANGE3,
  [RENDER_STATE.CLOSING]: Colors.ORANGE3,
  [RENDER_STATE.SELECTED]: Colors.ORANGE5,
  [RENDER_STATE.HOVERED]: Colors.ORANGE5,
};
export const FEATURE_FILL = {
  DEFAULT: Colors.ORANGE5,
  [RENDER_STATE.INACTIVE]: Colors.ORANGE5,
  [RENDER_STATE.HOVERED]: Colors.ORANGE3,
  [RENDER_STATE.SELECTED]: Colors.ORANGE5,
  [RENDER_STATE.UNCOMMITTED]: Colors.ORANGE4,
  [RENDER_STATE.CLOSING]: Colors.GRAY1,
};
function getFeatureStyle({ feature, state }: any) {
  return {
    stroke: FEATURE_STROKE[state] || FEATURE_STROKE.DEFAULT,
    strokeWidth: 2,
    fill: FEATURE_FILL[state] || FEATURE_FILL.DEFAULT,
    fillOpacity: 0.2,
    ...(state !== RENDER_STATE.SELECTED ? { strokeDasharray: '4,2' } : null),
  };
}

const DRAW_POLYGON_MODE = new DrawPolygonMode();

function getEditorMode(mapDrawingMode: MapDrawingMode) {
  switch (mapDrawingMode) {
    case MapDrawingMode.POLYGON:
      return DRAW_POLYGON_MODE;
  }
  return undefined;
}

interface EditInfo {
  data: MapDrawingFeature[];
  editType: 'addFeature';
}

const MapDrawingEditor: React.FC<Props> = ({ mapDrawingMode, onFeatureDrawn }) => {
  const cancelDrawing = useCallback(() => {
    onFeatureDrawn(undefined);
  }, [onFeatureDrawn]);

  useEffect(() => {
    function handleKeyDown(e: Event) {
      if (e instanceof KeyboardEvent && e.code === 'Escape') {
        cancelDrawing();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [cancelDrawing]);

  const handleUpdate = (info: EditInfo) => {
    if (info.editType === 'addFeature') {
      const { data } = info;
      if (data.length > 0) {
        onFeatureDrawn(data[data.length - 1]);
      } else {
        onFeatureDrawn(undefined);
      }
    }
  };
  return (
    <Editor
      clickRadius={HANDLE_RADIUS}
      mode={getEditorMode(mapDrawingMode)}
      editHandleShape="circle"
      onUpdate={handleUpdate}
      featureStyle={getFeatureStyle}
      editHandleStyle={getEditHandleStyle}
    />
  );
};

export default MapDrawingEditor;
