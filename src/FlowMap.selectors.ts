import { createSelector, ParametricSelector } from 'reselect';
import { MAX_ZOOM_LEVEL, State } from './FlowMap.state';
import {
  ConfigPropName,
  Flow,
  getFlowDestId,
  getFlowMagnitude,
  getFlowOriginId,
  getLocationCentroid,
  getLocationId,
  Location
} from './types';
import * as Cluster from '@flowmap.gl/cluster';
import { isCluster } from '@flowmap.gl/cluster';
import getColors from './colors';
import { DEFAULT_MAP_STYLE_DARK, DEFAULT_MAP_STYLE_LIGHT, parseBoolConfigProp } from './config';
import { nest } from 'd3-collection';
import { Props } from './FlowMap';


export type Selector<T> = ParametricSelector<State, Props, T>




export const getFlows = (state: State, props: Props) => props.flowsFetch.value
export const getLocations = (state: State, props: Props) => props.locationsFetch.value
export const getSelectedLocations = (state: State, props: Props) => state.selectedLocations
export const getClusteringEnabled = (state: State, props: Props) => state.clusteringEnabled
export const getZoom = (state: State, props: Props) => state.viewState.zoom
export const getConfig = (state: State, props: Props) => props.config


export const getLocationIds: Selector<Set<string> | undefined> = createSelector(
  getLocations,
  locations => locations ? new Set(locations.map(getLocationId)) : undefined
)

export const getFlowsForKnownLocations: Selector<Flow[] | undefined> = createSelector(
  getFlows,
  getLocationIds,
  (flows, ids) => {
    if (!ids || !flows) return undefined
    return flows.filter(flow =>
      ids.has(getFlowOriginId(flow)) &&
      ids.has(getFlowDestId(flow))
    )
  }
)


export const getLocationsHavingFlows: Selector<Location[] | undefined> = createSelector(
    getFlowsForKnownLocations,
    getLocations,
    (flows, locations) => {
      if (!locations || !flows) return locations;
      const withFlows = new Set();
      for (const flow of flows) {
        withFlows.add(getFlowOriginId(flow));
        withFlows.add(getFlowDestId(flow));
      }
      return locations.filter((location: Location) => withFlows.has(getLocationId(location)));
    }
  )

export const getClusterIndex: Selector<Cluster.ClusterIndex | undefined> = createSelector(
  getLocationsHavingFlows,
  getFlowsForKnownLocations,
  (locations, flows) => {
    if (!locations || !flows) return undefined

    const getLocationWeight = Cluster.makeLocationWeightGetter(
      flows,
      { getFlowOriginId, getFlowDestId, getFlowMagnitude }
    );
    const clusterLevels = Cluster.clusterLocations(
      locations,
      { getLocationId, getLocationCentroid },
      getLocationWeight,
      {
        maxZoom: MAX_ZOOM_LEVEL,
      }
    );
    const clusterIndex = Cluster.buildIndex(clusterLevels);

    const locationsById = nest<Location, Location>()
      .key((d: Location) => d.id)
      .rollup(([d]) => d)
      .object(locations)

    // Adding meaningful names
    const getName = (id: string) => {
      const loc = locationsById[id]
      if (loc) return loc.name || loc.id || id
      return `#${id}`
    }
    for (const level of clusterLevels) {
      for (const node of level.nodes) {
        // Here mutating the nodes (adding names)
        if (isCluster(node)) {
          const leaves = clusterIndex.expandCluster(node);
          const topId = leaves.reduce((m: string | undefined, d: string) =>
            (!m || getLocationWeight(d) > getLocationWeight(m) ? d : m)
          )
          const otherId = leaves.length === 2 && leaves.find(id => id !== topId)
          node.name = `"${getName(topId)}" and ${otherId ? `"${getName(otherId)}"` : `${leaves.length - 1} others`}`
        } else {
          (node as any).name = getName(node.id)
        }
      }
    }

    return clusterIndex
  }
)

export const getClusterZoom: Selector<number | undefined> = createSelector(
  getClusterIndex,
  getZoom,
  getSelectedLocations,
  (clusterIndex, zoom, selectedLocations) => {
    if (!clusterIndex) return undefined
    let minZoom = clusterIndex.availableZoomLevels[0]
    const maxZoom = clusterIndex.availableZoomLevels[clusterIndex.availableZoomLevels.length - 1]
    if (selectedLocations) {
      for (const id of selectedLocations) {
        let itemZoom
        const cluster = clusterIndex.getClusterById(id)
        if (cluster) {
          if (cluster) itemZoom = cluster.zoom
        } else {
          itemZoom = clusterIndex.getMinZoomForLocation(id)
        }
        if (itemZoom !== undefined && itemZoom > minZoom) {
          minZoom = itemZoom
        }
      }
    }
    return Math.max(minZoom, Math.min(Math.floor(zoom), maxZoom));
  }
)



export const getLocationsForSearchBox: Selector<(Location | Cluster.Cluster)[] | undefined> = createSelector(
  getClusteringEnabled,
  getLocationsHavingFlows,
  getSelectedLocations,
  getClusterZoom,
  getClusterIndex,
  (clusteringEnabled, locations, selectedLocations, clusterZoom, clusterIndex) => {
    if (!locations) return undefined
    let result: (Location | Cluster.Cluster)[] = locations
    if (clusteringEnabled) {
      if (clusterIndex) {
        const zoomItems = clusterIndex.getClusterNodesFor(clusterZoom)
        if (zoomItems) {
          result = result.concat(zoomItems.filter(Cluster.isCluster))
        }
      }
    }

    if (result && clusterIndex && selectedLocations) {
      const toAppend = []
      for (const id of selectedLocations) {
        const cluster = clusterIndex.getClusterById(id)
        if (cluster && !result.find(d => d.id === id)) {
          toAppend.push(cluster)
        }
      }
      if (toAppend.length > 0) {
        result = result.concat(toAppend)
      }
    }
    return result
  }
)


export const getDiffMode: Selector<boolean> = createSelector(
  getFlows,
  flows => {
    if (flows && flows.find(f => getFlowMagnitude(f) < 0)) {
      return true
    }
    return false
  }
)

export const getColorSchemeKey: Selector<string | undefined> = (state: State, props: Props) => state.colorSchemeKey

export const getDarkMode: Selector<boolean> = (state: State, props: Props) => state.darkMode

export const getFadeAmount: Selector<number> = (state: State, props: Props) => state.fadeAmount

export const getAnimate: Selector<boolean> = (state: State, props: Props) => state.animationEnabled

export const getFlowMapColors = createSelector(
  getConfig,
  getDiffMode,
  getColorSchemeKey,
  getDarkMode,
  getFadeAmount,
  getAnimate,
  getColors,
)

export const getMapboxMapStyle = createSelector(
  getConfig,
  getDarkMode,
  (config, darkMode) => {
    const configMapStyle = config[ConfigPropName.MAPBOX_MAP_STYLE];
    if (configMapStyle) {
      if (darkMode === parseBoolConfigProp(config[ConfigPropName.COLORS_DARK_MODE])) {
        return configMapStyle
      }
    }
    return darkMode ? DEFAULT_MAP_STYLE_DARK : DEFAULT_MAP_STYLE_LIGHT
  }
)

export const getInvalidLocationIds: Selector<string[] | undefined> = createSelector(
  getLocations,
  (locations) => {
    if (!locations) return undefined
    const invalid = []
    for (const location of locations) {
      if (!(-90 <= location.lat && location.lat <= 90) || !(-180 <= location.lon && location.lon <= 180)) {
        invalid.push(location.id)
      }
    }
    return invalid.length > 0 ? invalid : undefined
  }
)

export const getUnknownLocations: Selector<Set<string> | undefined> = createSelector(
  getLocationIds,
  getFlows,
  getFlowsForKnownLocations,
  (ids, flows, flowsForKnownLocations) => {
    if (!ids || !flows) return undefined
    if (flowsForKnownLocations && flows.length === flowsForKnownLocations.length) return undefined
    const missing = new Set<string>()
    for (const flow of flows) {
      if (!ids.has(getFlowOriginId(flow))) missing.add(getFlowOriginId(flow))
      if (!ids.has(getFlowDestId(flow))) missing.add(getFlowDestId(flow))
    }
    return missing
  }
)


export const getAggregatedFlows: Selector<Flow[] | undefined> = createSelector(
  getClusterIndex,
  getFlowsForKnownLocations,
  getClusterZoom,
  (clusterTree, flows, clusterZoom) => {
    if (!clusterTree || !flows || clusterZoom == null) return undefined
    return clusterTree.aggregateFlows(flows, clusterZoom, { getFlowOriginId, getFlowDestId, getFlowMagnitude })
  }
)

export const getMaxClusterZoom: Selector<number | undefined> = createSelector(
  getClusterIndex,
  clusterIndex => {
    if (!clusterIndex) return undefined
    return Math.max.apply(null, clusterIndex.availableZoomLevels)
  }
)

export const getExpandedSelection: Selector<Array<string> | undefined> = createSelector(
  getClusteringEnabled,
  getSelectedLocations,
  getClusterZoom,
  getClusterIndex,
  getMaxClusterZoom,
  (clusteringEnabled, selectedLocations, clusterZoom, clusterIndex, maxClusterZoom) => {
    if (!selectedLocations || !clusterIndex || clusterZoom === undefined) {
      return undefined
    }

    const targetZoom = clusteringEnabled ? clusterZoom : maxClusterZoom

    const result = new Set<string>()
    for (const locationId of selectedLocations) {
      const cluster = clusterIndex.getClusterById(locationId)
      if (cluster) {
        const expanded = clusterIndex.expandCluster(cluster, targetZoom)
        for (const id of expanded) {
          result.add(id)
        }
      } else {
        result.add(locationId)
      }
    }
    return Array.from(result)
  })

