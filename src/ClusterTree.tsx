import Supercluster from 'supercluster'
import {
  Flow,
  getFlowDestId, getFlowMagnitude,
  getFlowOriginId,
  isLocationCluster,
  Location,
  LocationCluster
} from './types'
import { nest } from 'd3-collection'
import { formatCount } from './TooltipContent'

const MAX_CLUSTER_ZOOM = 18
const CLUSTER_ID_PREFIX = 'cluster::'

export const makeClusterId = (id: string | number) => `${CLUSTER_ID_PREFIX}${id}`
export const isClusterId = (id: string) => id.startsWith(CLUSTER_ID_PREFIX)

export type Item = Location | LocationCluster
export type ClusteredFlowsByZoom = Map<number, Flow[]>

export function getLocationWeightGetter(flows: Flow[]) {
  const locationTotals = {
    incoming: new Map<string, number>(),
    outgoing: new Map<string, number>(),
  }
  for (const flow of flows) {
    const origin = getFlowOriginId(flow)
    const dest = getFlowDestId(flow)
    const count = getFlowMagnitude(flow)
    locationTotals.incoming.set(dest, (locationTotals.incoming.get(dest) || 0) + count)
    locationTotals.outgoing.set(origin, (locationTotals.outgoing.get(dest) || 0) + count)
  }

  return (id: string) => Math.max(
    locationTotals.incoming.get(id) || 0,
    locationTotals.outgoing.get(id) || 0,
  )
}



/**
 * Immutable
 */
export default class ClusterTree {
  private readonly locations: Location[]
  readonly minZoom: number
  readonly maxZoom: number
  private readonly itemsByZoom: Map<number, Item[]>
  private readonly itemsById: Map<string, LocationCluster>
  private readonly minZoomByLocationId: Map<string, number>

  constructor(locations: Location[], getLocationWeight: (id: string) => number) {
    const index = new Supercluster({
      radius: 40,
      maxZoom: MAX_CLUSTER_ZOOM,
    })

    index.load(locations.map(location => ({
      type: 'Feature' as 'Feature',
      properties: {
        location,
        weight: getLocationWeight(location.id),
      },
      geometry: {
        type: 'Point' as 'Point',
        coordinates: [location.lon, location.lat],
      },
    })))

    const trees: any[] = (index as any).trees
    // if (trees.length === 0) return undefined
    const numbersOfClusters = trees.map(d => d.points.length)
    const maxZoom = numbersOfClusters.indexOf(numbersOfClusters[numbersOfClusters.length - 1])
    const minZoom = Math.min(maxZoom, numbersOfClusters.lastIndexOf(numbersOfClusters[0]))

    const itemsByZoom = new Map()
    const itemsById = new Map<string, LocationCluster>()
    const minZoomByLocationId = new Map()
    for (let zoom = maxZoom; zoom >= minZoom; zoom--) {
      const tree = trees[zoom]
      let childrenByParent
      if (zoom < maxZoom) {
        childrenByParent = nest<any, Item[]>()
          .key((point: any) => point.parentId)
          .rollup((points: any[]) =>
            points.map((p: any) => p.id ?
              itemsById.get(makeClusterId(p.id))! :
              locations[p.index]
            )
          )
          .object(trees[zoom + 1].points)
      }

      const items: Array<LocationCluster | Location> = []
      for (const point of tree.points) {
        const { id, x, y, index, numPoints, parentId } = point
        if (id === undefined) {
          const location = locations[index]
          minZoomByLocationId.set(location.id, zoom)
          items.push(location)
        } else {
          const cluster = {
            id: makeClusterId(id),
            parentId: parentId >= 0 ? makeClusterId(parentId) : undefined,
            name: `Cluster #${id} (${formatCount(numPoints)} locations)`,
            zoom,
            lon: xLng(x),
            lat: yLat(y),
            children: childrenByParent ? childrenByParent[id] : undefined,
          };
          items.push(cluster)
          itemsById.set(cluster.id, cluster)
        }
      }
      itemsByZoom.set(zoom, items)
    }



    this.locations = locations
    this.minZoom = minZoom
    this.maxZoom = maxZoom
    this.itemsByZoom = itemsByZoom
    this.itemsById = itemsById
    this.minZoomByLocationId = minZoomByLocationId
  }

  getItemsFor(zoom: number | undefined): (Item[] | undefined) {
    if (zoom === undefined) return this.locations
    return this.itemsByZoom.get(zoom)
  }

  findItemById(clusterId: string) {
    return this.itemsById.get(clusterId)
  }

  getMinZoomForLocation(locationId: string) {
    return this.minZoomByLocationId.get(locationId)
  }

  /**
   * Adds the list of loc/cluster IDs for targetZoom to idsToAddTo
   * Will mutate (append to) expandedIds.
   * Does not mutate ClusterTree
   */
  pushExpandedClusterIds(loc: LocationCluster | Location, targetZoom: number, expandedIds: string[]) {
    if (isLocationCluster(loc)) {
      if (targetZoom !== undefined) {
        if (targetZoom > loc.zoom) {
          for (const child of loc.children) {
            this.pushExpandedClusterIds(child, targetZoom, expandedIds)
          }
        } else {
          expandedIds.push(loc.id)
        }
      }
    } else {
      // TODO: make sure the location is for the zoom or fix the zoom to the location zoom
      expandedIds.push(loc.id)
    }
  }

  clusterFlows(flows: Flow[]): ClusteredFlowsByZoom {
    const { minZoom, maxZoom } = this
    const leavesToClustersByZoom = new Map<number, Map<string, Item>>()
    for (let zoom = maxZoom - 1; zoom >= minZoom; zoom--) {
      const result = new Map<string, Item>()
      const items = this.getItemsFor(zoom)
      if (!items) continue
      const nextLeavesToClusters = leavesToClustersByZoom.get(zoom + 1)!
      for (const item of items) {
        if (isLocationCluster(item)) {
          for (const child of item.children) {
            if (isClusterId(child.id)) {
              for (const [leafId, cluster] of nextLeavesToClusters.entries()) {
                if (cluster.id === child.id) {
                  result.set(leafId, item)
                }
              }
            } else {
              result.set(child.id, item)
            }
          }
        }
      }
      leavesToClustersByZoom.set(zoom, result)
    }

    const flowsByZoom = new Map()
    const findClusterFor = (locationId: string, zoom: number) => {
      const cluster = leavesToClustersByZoom.get(zoom)!.get(locationId)
      return cluster ? cluster.id : undefined
    }
    for (let zoom = minZoom; zoom <= maxZoom; zoom++) {
      if (zoom < maxZoom) {
        const flowsByOD: { [key:string]: Flow } = {}
        for (const f of flows) {
          const originId = getFlowOriginId(f)
          const destId = getFlowDestId(f)
          const originClusterId = findClusterFor(originId, zoom) || originId
          const destClusterId = findClusterFor(destId, zoom) || destId
          const key = `${originClusterId}:->:${destClusterId}`
          if (!flowsByOD[key]) {
            flowsByOD[key] = {
              origin: originClusterId,
              dest: destClusterId,
              count: 0,
            }
          }
          flowsByOD[key].count += f.count
        }
        flowsByZoom.set(zoom, Object.values(flowsByOD));
      } else {
        flowsByZoom.set(zoom, flows);
      }
    }
    return flowsByZoom
  }

}

// spherical mercator to longitude/latitude
function xLng(x: number) {
  return (x - 0.5) * 360
}
function yLat(y: number) {
  const y2 = (180 - y * 360) * Math.PI / 180
  return 360 * Math.atan(Math.exp(y2)) / Math.PI - 90
}
