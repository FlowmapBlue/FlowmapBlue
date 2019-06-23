import { Classes, Intent, MenuItem } from '@blueprintjs/core'
import { ItemPredicate, ItemRenderer } from '@blueprintjs/select'
import { nest } from 'd3-collection'
import React from 'react'
import { defaultMemoize } from 'reselect'
import { matchesSearchQuery } from './matchesSearchQuery'
import SearchBox from './SearchBox'
import { LocationSelection, Location, FlowDirection } from './types'
import styled from '@emotion/styled'
import { Cluster } from '@flowmap.gl/cluster'

export interface Props {
  selectedLocations: LocationSelection[] | undefined
  locations: (Location | Cluster)[]
  onSelectionChanged: (selectedLocations: LocationSelection[] | undefined) => void
}

const LocationTag = styled.div({
  display: 'flex',
  fontSize: 10,
  alignItems: 'center',
  '& > * + *': {
    marginLeft: 5,
  },
})

const itemPredicate: ItemPredicate<Location | Cluster> = (query, location) => {
  const { id, name } = location
  return matchesSearchQuery(query, `${id} ${name}`)
}

function sortLocations(locations: (Location | Cluster)[]): (Location | Cluster)[] {
  return locations.sort((a, b) => {
    const aname = a.name || a.id
    const bname = b.name || b.id
    if (aname < bname) return -1
    if (aname > bname) return 1
    return 0
  })
}

function getSelectedLocationsById(selectedLocations: LocationSelection[] | undefined) {
  if (!selectedLocations || selectedLocations.length === 0) {
    return undefined
  }
  return nest<LocationSelection, LocationSelection>()
    .key(d => d.id)
    .rollup(([d]) => d)
    .object(selectedLocations)
}

interface LocationsBySelectionStatus {
  selected: (Location | Cluster)[] | undefined
  unselected: (Location | Cluster)[]
}

function getLocationsBySelectionStatus(
  locations: (Location | Cluster)[],
  selectedLocations: LocationSelection[] | undefined,
): LocationsBySelectionStatus {
  const selectedByID = getSelectedLocationsById(selectedLocations)
  if (!selectedByID) {
    return {
      selected: undefined,
      unselected: locations,
    }
  }

  const { selected, unselected } = nest<Location | Cluster, LocationsBySelectionStatus>()
    .key(location => selectedByID[location.id] ? 'selected' : 'unselected')
    .object(locations)

  return {
    selected,
    unselected,
  }
}

const TextOverflowEllipsis = styled.span({
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  maxWidth: 180,
})

class LocationsSearchBox extends React.PureComponent<Props> {
  private getSortedLocations = defaultMemoize(sortLocations)
  private getLocationsBySelectionStatus = defaultMemoize(getLocationsBySelectionStatus)

  render() {
    const { locations, selectedLocations } = this.props
    const { selected, unselected } = this.getLocationsBySelectionStatus(this.getSortedLocations(locations), selectedLocations)
    return (
      <SearchBox<Location | Cluster>
        placeholder="Search for locations…"
        items={unselected}
        selectedItems={selected}
        maxItems={100}
        itemPredicate={itemPredicate}
        itemRenderer={this.itemRenderer}
        tagRenderer={this.tagRenderer}
        onCleared={this.handleSelectionCleared}
        onRemoved={this.handleLocationRemoved}
        onSelected={this.handleLocationSelected}
      />
    )
  }

  private tagRenderer = (location: Location | Cluster) => {
    const { selectedLocations } = this.props
    const selection = selectedLocations && selectedLocations.find(z => z.id === location.id)
    if (!selection) {
      return null
    }
    // return (
    //   <FlowDirectionDropdown
    //     selected={selection.direction}
    //     onChange={(dir: FlowDirection) => this.handleFlowDirectionChanged(location, dir)}
    //   >
    //     <LocationTag>
    //       <FlowDirectionIcon width={11} height={8} dir={selection.direction} />
    //       <TextOverflowEllipsis>{location.name}</TextOverflowEllipsis>
    //     </LocationTag>
    //   </FlowDirectionDropdown>
    // )
    return (
      <LocationTag>
        {/*<FlowDirectionIcon width={11} height={8} dir={selection.direction} />*/}
        <TextOverflowEllipsis>{location.name}</TextOverflowEllipsis>
      </LocationTag>
    )
  }

  private itemRenderer: ItemRenderer<Location | Cluster> = (item, { handleClick, modifiers }) => {
    if (!modifiers.matchesPredicate) {
      return null
    }
    const { id, name } = (item as Location | Cluster)
    const { selectedLocations } = this.props
    const isSelected = selectedLocations && selectedLocations.find(d => d.id === id)
    const intent = isSelected ? Intent.PRIMARY : Intent.NONE
    return <MenuItem key={id} active={modifiers.active} text={name} intent={intent} onClick={handleClick} />
  }

  private handleSelectionCleared = () => this.props.onSelectionChanged(undefined)

  // private handleFlowDirectionChanged = (location: Location, direction: FlowDirection) => {
  //   const { selectedLocations, onSelectionChanged } = this.props
  //   if (selectedLocations) {
  //     const locationId = location.id
  //     const index = selectedLocations.findIndex(z => z.id === locationId)
  //     if (index >= 0) {
  //       const next = selectedLocations.slice()
  //       next[index] = { id: locationId, direction }
  //       onSelectionChanged(next)
  //     }
  //   }
  // }

  private handleLocationSelected = (location: Location | Cluster) => {
    const { selectedLocations, onSelectionChanged } = this.props
    const { id } = location
    const locationSelection = { id, direction: FlowDirection.BOTH }
    if (selectedLocations) {
      if (!selectedLocations.find(z => z.id === id)) {
        onSelectionChanged([...selectedLocations, locationSelection])
      }
    } else {
      onSelectionChanged([locationSelection])
    }
  }

  private handleLocationRemoved = (location: Location | Cluster) => {
    const { selectedLocations, onSelectionChanged } = this.props
    if (selectedLocations) {
      const { id } = location
      const idx = selectedLocations.findIndex(z => z.id === id)
      if (idx >= 0) {
        const next = selectedLocations.slice();
        next.splice(idx, 1);
        onSelectionChanged(
          selectedLocations.length === 1 ?
            undefined : next
        )
      }
    }
  }
}

export default LocationsSearchBox
