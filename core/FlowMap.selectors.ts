import {createSelector, defaultMemoize, ParametricSelector} from 'reselect';
import {_GlobeViewport as GlobeViewport} from '@deck.gl/core';
import {LocationFilterMode, MAX_ZOOM_LEVEL, State} from './FlowMap.state';
import {
  Config,
  ConfigPropName,
  CountByTime,
  Flow,
  getFlowDestId,
  getFlowMagnitude,
  getFlowOriginId,
  getFlowTime,
  getLocationId,
  Location,
} from './types';
import {
  addClusterNames,
  buildIndex,
  clusterLocations,
  findAppropriateZoomLevel,
  isCluster,
  makeLocationWeightGetter,
  type Cluster,
} from '@flowmap.gl/data';
import {
  DEFAULT_MAP_STYLE_DARK,
  DEFAULT_MAP_STYLE_LIGHT,
  DEFAULT_MAPBOX_ACCESS_TOKEN,
  parseBoolConfigProp,
} from './config';
import {nest} from 'd3-collection';
import type {Props} from './FlowMap';
import {flowmapAccessors} from './FlowMapDataProvider';
import {descending, min} from 'd3-array';
import {csvParseRows} from 'd3-dsv';
import {getTimeGranularityByOrder, getTimeGranularityForDate, TimeGranularity} from './time';

export const NUMBER_OF_FLOWS_TO_DISPLAY = 500000;

export type Selector<T> = ParametricSelector<State, Props, T>;

export const getFetchedFlows = (state: State, props: Props) => props.flowsFetch.value;
export const getFetchedLocations = (state: State, props: Props) => props.locationsFetch.value;
export const getSelectedLocations = (state: State, props: Props) => state.selectedLocations;
export const getLocationFilterMode = (state: State, props: Props) => state.locationFilterMode;
export const getClusteringEnabled = (state: State, props: Props) => state.clusteringEnabled;
const getGlobe = (state: State, props: Props) => state.globe;
const getClusterMapZoom = createSelector(
  getGlobe,
  (state: State, props: Props) => state.viewport.zoom,
  (state: State, props: Props) => state.viewport.latitude,
  // Match the spherical scale used by FlowmapLayer rather than the Mercator zoom.
  (globe, zoom, latitude) =>
    globe ? Math.log2(new GlobeViewport({zoom, latitude}).scale * Math.PI) : zoom,
);
export const getConfig = (state: State, props: Props) => props.config;
export const getSelectedTimeRange = (state: State, props: Props) => state.selectedTimeRange;

export const getInvalidLocationIds: Selector<string[] | undefined> = createSelector(
  getFetchedLocations,
  (locations) => {
    if (!locations) return undefined;
    const invalid = [];
    for (const location of locations) {
      if (
        !(-90 <= location.lat && location.lat <= 90) ||
        !(-180 <= location.lon && location.lon <= 180)
      ) {
        invalid.push(location.id);
      }
    }
    return invalid.length > 0 ? invalid : undefined;
  },
);

export const getLocations: Selector<Location[] | undefined> = createSelector(
  getFetchedLocations,
  getInvalidLocationIds,
  (locations, invalidIds) => {
    if (!locations) return undefined;
    if (!invalidIds || invalidIds.length === 0) return locations;
    const invalid = new Set(invalidIds);
    return locations.filter((location) => !invalid.has(getLocationId(location)));
  },
);

export const getLocationIds: Selector<Set<string> | undefined> = createSelector(
  getLocations,
  (locations) => (locations ? new Set(locations.map(getLocationId)) : undefined),
);

export const getSelectedLocationsSet: Selector<Set<string> | undefined> = createSelector(
  getSelectedLocations,
  (ids) => (ids && ids.length > 0 ? new Set(ids) : undefined),
);

export const getSortedFlowsForKnownLocations: Selector<Flow[] | undefined> = createSelector(
  getFetchedFlows,
  getLocationIds,
  (flows, ids) => {
    if (!ids || !flows) return undefined;
    return flows
      .filter((flow) => ids.has(getFlowOriginId(flow)) && ids.has(getFlowDestId(flow)))
      .sort((a, b) => descending(Math.abs(getFlowMagnitude(a)), Math.abs(getFlowMagnitude(b))));
  },
);

const getActualTimeExtent: Selector<[Date, Date] | undefined> = createSelector(
  getSortedFlowsForKnownLocations,
  (flows) => {
    if (!flows) return undefined;
    let start = null;
    let end = null;
    for (const {time} of flows) {
      if (time) {
        if (start == null || start > time) start = time;
        if (end == null || end < time) end = time;
      }
    }
    if (!start || !end) return undefined;
    return [start, end];
  },
);

export const getTimeGranularity: Selector<TimeGranularity | undefined> = createSelector(
  getSortedFlowsForKnownLocations,
  getActualTimeExtent,
  (flows, timeExtent) => {
    if (!flows || !timeExtent) return undefined;

    const minOrder = min(flows, (d) => getTimeGranularityForDate(getFlowTime(d)!).order);
    if (minOrder == null) return undefined;
    return getTimeGranularityByOrder(minOrder);
  },
);

export const getTimeExtent: Selector<[Date, Date] | undefined> = createSelector(
  getActualTimeExtent,
  getTimeGranularity,
  (timeExtent, timeGranularity) => {
    if (!timeExtent || !timeGranularity?.interval) return undefined;
    const {interval} = timeGranularity;
    return [timeExtent[0], interval.offset(interval.floor(timeExtent[1]), 1)];
  },
);

export const getSortedFlowsForKnownLocationsFilteredByTime: Selector<Flow[] | undefined> =
  createSelector(
    getSortedFlowsForKnownLocations,
    getTimeExtent,
    getSelectedTimeRange,
    (flows, timeExtent, timeRange) => {
      if (!flows) return undefined;
      if (
        !timeExtent ||
        !timeRange ||
        (timeExtent[0] === timeRange[0] && timeExtent[1] === timeRange[1])
      ) {
        return flows;
      }
      return flows.filter((flow) => {
        const time = getFlowTime(flow);
        return time && timeRange[0] <= time && time < timeRange[1];
      });
    },
  );

export const getLocationsHavingFlows: Selector<Location[] | undefined> = createSelector(
  getSortedFlowsForKnownLocations,
  getLocations,
  (flows, locations) => {
    if (!locations || !flows) return locations;
    const withFlows = new Set();
    for (const flow of flows) {
      withFlows.add(getFlowOriginId(flow));
      withFlows.add(getFlowDestId(flow));
    }
    return locations.filter((location: Location) => withFlows.has(getLocationId(location)));
  },
);

const getLocationWeightGetter = createSelector(
  getSortedFlowsForKnownLocations,
  (flows) =>
    flows && makeLocationWeightGetter(flows, {getFlowOriginId, getFlowDestId, getFlowMagnitude}),
);

const getClusterLevels = createSelector(
  getLocationsHavingFlows,
  getLocationWeightGetter,
  getGlobe,
  (locations, getLocationWeight, globe) => {
    if (!locations?.length || !getLocationWeight) return undefined;
    return clusterLocations(locations, flowmapAccessors, getLocationWeight, {
      maxZoom: MAX_ZOOM_LEVEL,
      projection: globe ? 'globe' : 'mercator',
    });
  },
);

export const getClusterIndex = createSelector(
  getLocationsHavingFlows,
  getLocationWeightGetter,
  getClusterLevels,
  (locations, getLocationWeight, clusterLevels) => {
    if (!locations || !getLocationWeight || !clusterLevels?.length) return undefined;
    const clusterIndex = buildIndex<Flow>(clusterLevels);

    addClusterNames(
      clusterIndex,
      clusterLevels,
      new Map(locations.map((location) => [location.id, location])),
      flowmapAccessors,
      getLocationWeight,
    );
    return clusterIndex;
  },
);

export const getAvailableClusterZoomLevels = createSelector(
  getClusterIndex,
  getSelectedLocations,
  (clusterIndex, selectedLocations): number[] | undefined => {
    if (!clusterIndex) {
      return undefined;
    }

    let maxZoom = Number.POSITIVE_INFINITY;
    let minZoom = Number.NEGATIVE_INFINITY;

    const adjust = (zoneId: string) => {
      const cluster = clusterIndex.getClusterById(zoneId);
      if (cluster) {
        minZoom = Math.max(minZoom, cluster.zoom);
        maxZoom = Math.min(maxZoom, cluster.zoom);
      } else {
        const zoom = clusterIndex.getMinZoomForLocation(zoneId);
        minZoom = Math.max(minZoom, zoom);
      }
    };

    if (selectedLocations) {
      for (const id of selectedLocations) {
        adjust(id);
      }
    }

    return clusterIndex.availableZoomLevels.filter((level) => minZoom <= level && level <= maxZoom);
  },
);

export function getClusterZoom(state: State, props: Props) {
  if (!state.clusteringEnabled) return undefined;
  const available = getAvailableClusterZoomLevels(state, props);
  if (!available?.length) return undefined;
  const zoom = state.clusteringAuto ? undefined : state.manualClusterZoom;
  return findAppropriateZoomLevel(available, zoom ?? getClusterMapZoom(state, props));
}

export const getLocationsForSearchBox: Selector<(Location | Cluster)[] | undefined> =
  createSelector(
    getClusteringEnabled,
    getLocationsHavingFlows,
    getSelectedLocations,
    getClusterZoom,
    getClusterIndex,
    (clusteringEnabled, locations, selectedLocations, clusterZoom, clusterIndex) => {
      if (!locations) return undefined;
      let result: (Location | Cluster)[] = locations;
      if (clusteringEnabled) {
        if (clusterIndex) {
          const zoomItems = clusterIndex.getClusterNodesFor(clusterZoom);
          if (zoomItems) {
            result = result.concat(zoomItems.filter(isCluster));
          }
        }
      }

      if (result && clusterIndex && selectedLocations) {
        const toAppend = [];
        for (const id of selectedLocations) {
          const cluster = clusterIndex.getClusterById(id);
          if (cluster && !result.find((d) => d.id === id)) {
            toAppend.push(cluster);
          }
        }
        if (toAppend.length > 0) {
          result = result.concat(toAppend);
        }
      }
      return result;
    },
  );

export const getDarkMode: Selector<boolean> = (state: State, props: Props) => state.darkMode;

export const getMapboxMapStyle = createSelector(getConfig, getDarkMode, (config, darkMode) => {
  const configMapStyle = config[ConfigPropName.MAPBOX_MAP_STYLE];
  if (configMapStyle) {
    return configMapStyle;
  }
  const accessToken = config[ConfigPropName.MAPBOX_ACCESS_TOKEN];
  if (accessToken !== DEFAULT_MAPBOX_ACCESS_TOKEN) {
    return darkMode ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/light-v11';
  } else {
    return darkMode ? DEFAULT_MAP_STYLE_DARK : DEFAULT_MAP_STYLE_LIGHT;
  }
});

export const getUnknownLocations: Selector<Set<string> | undefined> = createSelector(
  getLocationIds,
  getFetchedFlows,
  getSortedFlowsForKnownLocations,
  (ids, flows, flowsForKnownLocations) => {
    if (!ids || !flows) return undefined;
    if (flowsForKnownLocations && flows.length === flowsForKnownLocations.length) return undefined;
    const missing = new Set<string>();
    for (const flow of flows) {
      if (!ids.has(getFlowOriginId(flow))) missing.add(getFlowOriginId(flow));
      if (!ids.has(getFlowDestId(flow))) missing.add(getFlowDestId(flow));
    }
    return missing;
  },
);

function aggregateFlows(flows: Flow[]) {
  // Sum up flows with same origin, dest
  const byOriginDest = nest<Flow, Flow>()
    .key(getFlowOriginId)
    .key(getFlowDestId)
    .rollup((ff: Flow[]) => {
      const origin = getFlowOriginId(ff[0]);
      const dest = getFlowDestId(ff[0]);
      const color = ff[0].color;
      const rv: Flow = {
        origin,
        dest,
        count: ff.reduce((m, f) => {
          const count = getFlowMagnitude(f);
          if (count) {
            if (!isNaN(count) && isFinite(count)) return m + count;
          }
          return m;
        }, 0),
        time: undefined,
      };
      if (color) rv.color = color;
      return rv;
    })
    .entries(flows);
  const rv: Flow[] = [];
  for (const {values} of byOriginDest) {
    for (const {value} of values) {
      rv.push(value);
    }
  }
  return rv;
}

// Pre-aggregate dated flows with the app's existing time range and color rules.
export const getLayerData = createSelector(
  getLocationsHavingFlows,
  getSortedFlowsForKnownLocationsFilteredByTime,
  getClusterLevels,
  getTimeExtent,
  (locations, flows, clusterLevels, timeExtent) => ({
    locations,
    flows: flows && timeExtent ? aggregateFlows(flows) : flows,
    clusterLevels: clusterLevels?.length ? clusterLevels : undefined,
  }),
);

export const getExpandedSelectedLocationsSet: Selector<Set<string> | undefined> = createSelector(
  getSelectedLocationsSet,
  getClusterIndex,
  (selectedLocations, clusterIndex) => {
    if (!selectedLocations || !clusterIndex) {
      return selectedLocations;
    }

    const result = new Set<string>();
    for (const locationId of selectedLocations) {
      const cluster = clusterIndex.getClusterById(locationId);
      if (cluster) {
        const expanded = clusterIndex.expandCluster(cluster);
        for (const id of expanded) {
          result.add(id);
        }
      } else {
        result.add(locationId);
      }
    }
    return result;
  },
);

export const getTotalCountsByTime: Selector<CountByTime[] | undefined> = createSelector(
  getSortedFlowsForKnownLocations,
  getTimeGranularity,
  getTimeExtent,
  getExpandedSelectedLocationsSet,
  getLocationFilterMode,
  (flows, timeGranularity, timeExtent, selectedLocationSet, locationFilterMode) => {
    if (!flows || !timeGranularity || !timeExtent) return undefined;
    const byTime = flows.reduce((m, flow) => {
      if (isFlowInSelection(flow, selectedLocationSet, locationFilterMode)) {
        const key = timeGranularity.interval(getFlowTime(flow)!).getTime();
        m.set(key, (m.get(key) ?? 0) + getFlowMagnitude(flow));
      }
      return m;
    }, new Map<number, number>());

    return Array.from(byTime.entries()).map(([millis, count]) => ({
      time: new Date(millis),
      count,
    }));
  },
);

export const getFlowsSheets = defaultMemoize((config: Config) => {
  const sheets = config[ConfigPropName.FLOWS_SHEETS];
  if (sheets) {
    return csvParseRows(sheets)[0].map((s) => s.trim());
  }
  return undefined;
});

function isFlowInSelection(
  flow: Flow,
  selectedLocationsSet: Set<string> | undefined,
  locationFilterMode: LocationFilterMode,
) {
  const {origin, dest} = flow;
  if (selectedLocationsSet) {
    switch (locationFilterMode) {
      case LocationFilterMode.ALL:
        return selectedLocationsSet.has(origin) || selectedLocationsSet.has(dest);
      case LocationFilterMode.BETWEEN:
        return selectedLocationsSet.has(origin) && selectedLocationsSet.has(dest);
      case LocationFilterMode.INCOMING:
        return selectedLocationsSet.has(dest);
      case LocationFilterMode.OUTGOING:
        return selectedLocationsSet.has(origin);
    }
  }
  return true;
}

export const getTotalUnfilteredCount: Selector<number | undefined> = createSelector(
  getSortedFlowsForKnownLocations,
  (flows) => {
    if (!flows) return undefined;
    return flows.reduce((m, flow) => m + getFlowMagnitude(flow), 0);
  },
);

export const getTotalFilteredCount: Selector<number | undefined> = createSelector(
  getSortedFlowsForKnownLocationsFilteredByTime,
  getExpandedSelectedLocationsSet,
  getLocationFilterMode,
  (flows, selectedLocationSet, locationFilterMode) => {
    if (!flows) return undefined;
    const count = flows.reduce((m, flow) => {
      if (isFlowInSelection(flow, selectedLocationSet, locationFilterMode)) {
        return m + getFlowMagnitude(flow);
      }
      return m;
    }, 0);
    return count;
  },
);
