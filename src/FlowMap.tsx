import DeckGL, { MapController } from 'deck.gl'
import * as React from 'react'
import { FlyToInterpolator, StaticMap } from 'react-map-gl'
import FlowMapLayer, { LocationTotalsLegend } from 'flowmap.gl'
import { colors } from './colors'
import { fitLocationsInView, getInitialViewState } from './fitInView'
import withFetchGoogleSheet, { pipe } from './withFetchGoogleSheet'
import LegendBox from './LegendBox'
import * as d3ease from 'd3-ease'

const MAPBOX_TOKEN = process.env.REACT_APP_MapboxAccessToken
const CONTROLLER_OPTIONS = {
  type: MapController,
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


type Props = {
  locations: Location[]
  flows: Flow[]
  sheetKey: string
}

type ViewState = any

type State = {
  viewState: ViewState
  locations: Location[] | null
}

const getLocationCentroid = (location: Location): [number, number] => [+location.lon, +location.lat]


const initialViewState = getInitialViewState([ -180, -70, 180, 70 ]);

class FlowMap extends React.Component<Props, State> {

  state = {
    viewState: initialViewState,
    locations: null,
  }

  getLayers() {
    const { locations, flows } = this.props
    const layers = []
    if (locations && flows) {
      layers.push(
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
      )
    }
    return layers
  }

  static getDerivedStateFromProps(props: Props, state: State): State | null {
    const {locations} = props
    if (locations !== state.locations) {
      return {
        locations,
        viewState: {
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
          transitionDuration: 4000,
          transitionInterpolator: new FlyToInterpolator(),
          transitionEasing: d3ease.easeCubic,
        }
      }
    }
    return null
  }

  handleViewStateChange = ({ viewState }: { viewState: ViewState }) => {
    this.setState({ viewState })
  }

  render() {
    const { flows, sheetKey } = this.props
    const { viewState } = this.state
    return (
      <>
        <DeckGL
          style={{ mixBlendMode: 'multiply' }}
          controller={CONTROLLER_OPTIONS}
          viewState={viewState}
          onViewStateChange={this.handleViewStateChange}
          layers={this.getLayers()}
          children={({ width, height, viewState }: any) => (
            <StaticMap mapboxApiAccessToken={MAPBOX_TOKEN} width={width} height={height} viewState={viewState} />
          )}
        />
        {flows &&
        <>
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
        </>}
      </>
    )
  }
}


export default ({ sheetKey }: { sheetKey: string }) => {
  const FlowMapWithData = pipe(
    withFetchGoogleSheet(sheetKey,'locations'),
    withFetchGoogleSheet(sheetKey,'flows'),
  )(FlowMap)
  return <FlowMapWithData sheetKey={sheetKey} />
}
