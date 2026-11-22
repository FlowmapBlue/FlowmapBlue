import {
  colorAsRgba,
  FlowmapData,
  isMagnitudeOutsideScaleDomain,
  LocalFlowmapDataProvider,
  RGBA,
} from '@flowmap.gl/data';
import {
  Flow,
  getFlowDestId,
  getFlowMagnitude,
  getFlowOriginId,
  getLocationId,
  Location,
} from './types';

export const flowmapAccessors = {
  getLocationId,
  getLocationName: (location: Location) => location.name || location.id,
  getLocationLat: (location: Location) => location.lat,
  getLocationLon: (location: Location) => location.lon,
  getFlowOriginId,
  getFlowDestId,
  getFlowMagnitude,
};

// Flowmap.gl scales colors by magnitude. Preserve explicit colors for routes
// in the input without assigning any single route's color to a cluster total.
export default class FlowMapDataProvider extends LocalFlowmapDataProvider<Location, Flow> {
  private readonly routeColors = new Map<string | number, Map<string | number, RGBA>>();

  constructor(data: FlowmapData<Location, Flow>) {
    super(flowmapAccessors);
    this.setFlowmapData(data);
    for (const flow of data.flows ?? []) {
      if (!flow.color) continue;
      let destinations = this.routeColors.get(flow.origin);
      if (!destinations) this.routeColors.set(flow.origin, (destinations = new Map()));
      if (!destinations.has(flow.dest)) destinations.set(flow.dest, colorAsRgba(flow.color));
    }
  }

  async getLayersData() {
    if (!this.routeColors.size) return super.getLayersData();
    const dataPromise = super.getLayersData();
    const flows = this.getFlowsForFlowmapLayer();
    const data = await dataPromise;
    if (!data || !flows) return data;

    const {lineAttributes, scaleState} = data;
    const {getColor} = lineAttributes.attributes;
    const flowScale = scaleState?.flowThickness;
    const outOfScaleDomain = flowScale?.outOfScale ? flowScale.domain : undefined;
    let colors: Uint8Array | undefined;
    flows.forEach(({origin, dest, count}, index) => {
      const color = this.routeColors.get(origin)?.get(dest);
      if (color && !isMagnitudeOutsideScaleDomain(count, outOfScaleDomain)) {
        colors ??= getColor.value.slice();
        colors.set(color, index * getColor.size);
      }
    });
    if (!colors) return data;

    return {
      ...data,
      lineAttributes: {
        ...lineAttributes,
        attributes: {...lineAttributes.attributes, getColor: {...getColor, value: colors}},
      },
    };
  }
}
