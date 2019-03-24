import Supercluster from 'supercluster'
import { isLocationCluster, Location, LocationCluster } from './types'
import { nest } from 'd3-collection'
import { formatCount } from './TooltipContent'

const MAX_CLUSTER_ZOOM = 18
const CLUSTER_ID_PREFIX = 'cluster::'

export const makeClusterId = (id: string | number) => `${CLUSTER_ID_PREFIX}${id}`
export const isClusterId = (id: string) => id.startsWith(CLUSTER_ID_PREFIX)


export default class ClusterTree {
  private readonly locations: Location[]
  readonly minZoom: number
  readonly maxZoom: number
  private readonly itemsByZoom: Map<number, (Location | LocationCluster)[]>
  private readonly leavesToClustersByZoom: Map<number, Map<string, (Location | LocationCluster)> | undefined>
  private readonly clustersById: Map<string, LocationCluster>

  constructor(locations: Location[]) {
    const index = new Supercluster({
      radius: 40,
      maxZoom: MAX_CLUSTER_ZOOM,
    })
    index.load(locations.map(location => ({
      type: 'Feature' as 'Feature',
      properties: {
        location,
      },
      geometry: {
        type: 'Point' as 'Point',
        coordinates: [location.lon, location.lat],
      },
    })))

    const trees: any[] = (index as any).trees
    // if (trees.length === 0) return undefined
    const numbersOfClusters = trees.map(d => d.points.length)
    const minZoom = numbersOfClusters.lastIndexOf(numbersOfClusters[0])
    const maxZoom = numbersOfClusters.indexOf(numbersOfClusters[numbersOfClusters.length - 1])

    const itemsByZoom = new Map()
    const clustersById = new Map<string, LocationCluster>()
    for (let zoom = maxZoom; zoom >= minZoom; zoom--) {
      const tree = trees[zoom]
      let childrenByParent
      if (zoom < maxZoom) {
        childrenByParent = nest<any, (Location | LocationCluster)[]>()
          .key((point: any) => point.parentId)
          .rollup((points: any[]) =>
            points.map((p: any) => p.id ?
              clustersById.get(makeClusterId(p.id))! :
              locations[p.index]
            )
          )
          .object(trees[zoom + 1].points)
      }

      const items: Array<LocationCluster | Location> = []
      for (const point of tree.points) {
        const { id, x, y, index, numPoints, parentId } = point
        if (id === undefined) {
          items.push(locations[index])
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
          clustersById.set(cluster.id, cluster)
        }
      }
      itemsByZoom.set(zoom, items)
    }


    const leavesToClustersByZoom = new Map<number, Map<string, (Location | LocationCluster)>>()
    for (let zoom = maxZoom - 1; zoom >= minZoom; zoom--) {
      const result = new Map<string, (Location | LocationCluster)>()
      const items = itemsByZoom.get(zoom)
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

    this.locations = locations
    this.minZoom = minZoom
    this.maxZoom = maxZoom
    this.itemsByZoom = itemsByZoom
    this.leavesToClustersByZoom = leavesToClustersByZoom
    this.clustersById = clustersById
  }

  getItemsFor(zoom: number | undefined) {
    if (zoom === undefined) return this.locations
    return this.itemsByZoom.get(zoom)
  }

  findClusterById(clusterId: string) {
    return this.clustersById.get(clusterId)
  }

  findClusterIdFor(locationId: string, zoom: number) {
    const leavesToClusters = this.leavesToClustersByZoom.get(zoom)
    if (leavesToClusters) {
      const cluster = leavesToClusters.get(locationId)
      return cluster ? cluster.id : undefined
    }
    return undefined
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
