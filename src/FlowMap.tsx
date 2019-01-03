import DeckGL from 'deck.gl'
import * as React from 'react'
import { StaticMap } from 'react-map-gl'
import FlowMapLayer, { LocationTotalsLegend } from 'flowmap.gl'
import { colors } from './colors'
import { fitLocationsInView } from './fitInView'
import withFetchGoogleSheet, { pipe } from './withFetchGoogleSheet'
import LegendBox from './LegendBox'

const MAPBOX_TOKEN = process.env.REACT_APP_MapboxAccessToken
const CONTROLLER_OPTIONS = {
  dragRotate: false,
  touchRotate: false,
}

interface Location {
  id: string
  lon: string
  lat: string
  name: string
}

interface Flow {
  origin: string
  dest: string
  count: string
}

const FlowMap = ({ sheetKey }: { sheetKey: string }) => {
  const Comp = pipe(
    withFetchGoogleSheet(sheetKey,'locations'),
    withFetchGoogleSheet(sheetKey,'flows'),
  )(({ locations, flows }: {
    locations: Location[]
    flows: Flow[]
  }) => {
    const getLocationCentroid = (location: Location): [number, number] => [+location.lon, +location.lat]
    const initialViewState = {
      ...fitLocationsInView(
        locations,
        getLocationCentroid,
        [
          window.innerWidth,
          window.innerHeight,
        ],),
      minPitch: 0,
      maxPitch: 0,
      bearing: 0,
      pitch: 0,
    }
    return (
      <>
        <DeckGL
          style={{ mixBlendMode: 'multiply' }}
          controller={CONTROLLER_OPTIONS}
          initialViewState={initialViewState}
          layers={[
            new FlowMapLayer({
              id: 'flow-map-layer',
              colors,
              locations,
              flows,
              getLocationCentroid,
              getFlowMagnitude: (flow: Flow) => +flow.count,
              getFlowOriginId: (flow: Flow) => flow.origin,
              getFlowDestId: (flow: Flow) => flow.dest,
              getLocationId: (loc: Location) => loc.id,
              varyFlowColorByMagnitude: true,
              showTotals: true,
            }),
          ]}
          children={({ width, height, viewState }: any) => (
            <StaticMap mapboxApiAccessToken={MAPBOX_TOKEN} width={width} height={height} viewState={viewState} />
          )}
        />
        <LegendBox bottom={35} right={10}>
          {`Showing ${flows.length} flows. `}
          <a
            href={`https://docs.google.com/spreadsheets/d/${sheetKey}`}
            target="_blank"
            rel="noopener"
          >
            Data source
          </a>
        </LegendBox>
        <LegendBox bottom={35} left={10}>
          <LocationTotalsLegend colors={colors} />
        </LegendBox>
      </>
    )
  })
  return <Comp />
}

export default FlowMap
