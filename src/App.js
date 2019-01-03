import React, {Component} from 'react'
import {StaticMap} from 'react-map-gl'
import DeckGL from 'deck.gl'
import FlowMapLayer from 'flowmap.gl'
import geoViewport from '@mapbox/geo-viewport'

const MAPBOX_TOKEN = process.env.REACT_APP_MapboxAccessToken

const getInitialViewport = () => {
  const bbox = [5.956453645364537, 45.818, 10.492, 47.808]
  const { center: [longitude, latitude], zoom } =
    geoViewport.viewport(
      bbox,
      [window.innerWidth, window.innerHeight],
      undefined, undefined, 512
    )
  return {
    longitude,
    latitude,
    zoom,
  }
}

const colors = {
  flows: {
    max: '#137CBD',
  },
  locationAreas: {
    outline: 'rgba(92,112,128,0.5)',
    normal: 'rgba(187,187,187,0.5)',
    selected: 'rgba(217,130,43,0.5)',
  },
}



export default class App extends Component {
  state = {
    locations: null,
    flows: null,
  }

  componentDidMount() {
    fetch('data/locations.json')
      .then(response => response.json())
      .then(json => this.setState({ locations: json }))

    fetch('data/flows.json')
      .then(response => response.json())
      .then(json => this.setState({ flows: json }))
  }

  render() {
    const { locations, flows } = this.state
    const layers = []
    if (locations && flows) {
      layers.push(
        new FlowMapLayer({
          colors,
          locations,
          flows,
          getLocationId: l => l.properties.abbr,
          getLocationCentroid: l => l.properties.centroid,
          getFlowOriginId: f => f.origin,
          getFlowDestId: f => f.dest,
          getFlowMagnitude: f => f.count,
          showTotals: true,
          showLocationAreas: true,
          locationCircleSize: 3,
          varyFlowColorByMagnitude: true,
        })
      )
    }

    return (
      <DeckGL
        initialViewState={getInitialViewport()}
        controller={true}
        layers={layers}
      >
        <StaticMap mapboxApiAccessToken={MAPBOX_TOKEN} />
      </DeckGL>
    )
  }
}
