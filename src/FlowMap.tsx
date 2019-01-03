import DeckGL from 'deck.gl'
import * as React from 'react'
import { StaticMap } from 'react-map-gl'
import FlowMapLayer, { LocationTotalsLegend } from 'flowmap.gl'
import { colors } from './colors'
import { fitLocationsInView } from './fitInView'
import withFetchCsv, { pipe } from './withFetchCsv'
import LegendBox from './LegendBox'

const MAPBOX_TOKEN = process.env.REACT_APP_MapboxAccessToken

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
    withFetchCsv('locations', `https://docs.google.com/spreadsheets/d/${sheetKey}/gviz/tq?tqx=out:csv&sheet=locations`),
    withFetchCsv('flows', `https://docs.google.com/spreadsheets/d/${sheetKey}/gviz/tq?tqx=out:csv&sheet=flows`),
  )(({ locations, flows }: {
    locations: Location[]
    flows: Flow[]
  }) => {
    const getLocationCentroid = (location: Location): [number, number] => [+location.lon, +location.lat]
    const initialViewState = fitLocationsInView(locations, getLocationCentroid, [
      window.innerWidth,
      window.innerHeight,
    ])
    return (
      <>
        <DeckGL
          style={{ mixBlendMode: 'multiply' }}
          controller={true}
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
            href={`https://docs.google.com/spreadsheets/d/${sheetKey}/edit?usp=sharing`}
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
