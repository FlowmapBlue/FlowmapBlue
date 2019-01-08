import DeckGL, { MapController } from 'deck.gl'
import * as React from 'react'
import { FlyToInterpolator, StaticMap, ViewStateChangeInfo } from 'react-map-gl'
import FlowMapLayer, { FlowLayerPickingInfo, LocationTotalsLegend, PickingType } from 'flowmap.gl'
import { colors } from './colors'
import { fitLocationsInView, getInitialViewState } from './fitInView'
import withFetchSheets from './withFetchGoogleSheet'
import LegendBox from './LegendBox'
import * as d3ease from 'd3-ease'
import Title from './Title';

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
  locations: Location[] | null
  flows: Flow[] | null
  spreadSheetKey: string
}

type ViewState = any

enum HighlightType {
  LOCATION = 'location',
  FLOW = 'flow',
}

interface LocationHighlight {
  type: HighlightType.LOCATION;
  locationId: string;
}

interface FlowHighlight {
  type: HighlightType.FLOW;
  flow: Flow;
}

type Highlight = LocationHighlight | FlowHighlight;

type State = {
  viewState: ViewState
  locations: Location[] | null
  highlight?: Highlight;
  selectedLocationIds?: string[];
}


const getFlowMagnitude = (flow: Flow) => +flow.count
const getFlowOriginId = (flow: Flow) => flow.origin
const getFlowDestId = (flow: Flow) => flow.dest
const getLocationId = (loc: Location) => loc.id
const getLocationCentroid = (location: Location): [number, number] => [+location.lon, +location.lat]

const initialViewState = getInitialViewState([ -180, -70, 180, 70 ]);

class FlowMap extends React.Component<Props, State> {
  readonly state: State = {
    viewState: initialViewState,
    locations: null,
  }

  getLayers() {
    const { locations, flows } = this.props
    const { highlight, selectedLocationIds } = this.state;
    const layers = []
    if (locations && flows) {
      layers.push(
        new FlowMapLayer({
          id: 'flow-map-layer',
          colors,
          locations,
          flows,
          getLocationCentroid,
          getFlowMagnitude,
          getFlowOriginId,
          getFlowDestId,
          getLocationId,
          varyFlowColorByMagnitude: true,
          showTotals: true,
          selectedLocationIds,
          highlightedLocationId: highlight && highlight.type === HighlightType.LOCATION ? highlight.locationId : undefined,
          highlightedFlow: highlight && highlight.type === HighlightType.FLOW ? highlight.flow : undefined,
          onHover: this.handleFlowMapHover,
          onClick: this.handleFlowMapClick,
        }),
      )
    }
    return layers
  }

  static getDerivedStateFromProps(props: Props, state: State): State | null {
    const {locations} = props
    if (locations != null && locations !== state.locations) {
      return {
        locations,
        viewState: {
          ...fitLocationsInView(
            locations,
            getLocationCentroid,
            [
              window.innerWidth,
              window.innerHeight,
            ],
            { pad: 0.05 }
            ),
          minPitch: 0,
          maxPitch: 0,
          bearing: 0,
          pitch: 0,
          transitionDuration: 2000,
          transitionInterpolator: new FlyToInterpolator(),
          transitionEasing: d3ease.easeCubic,
        }
      }
    }
    return null
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyDown)
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown)
  }

  handleViewStateChange = ({ viewState }: ViewStateChangeInfo) => {
    this.setState({ viewState })
  }

  private highlight(highlight: Highlight | undefined) {
    this.setState({ highlight });
  }

  private handleFlowMapHover = ({ type, object }: FlowLayerPickingInfo) => {
    switch (type) {
      case PickingType.FLOW: {
        if (!object) {
          this.highlight(undefined);
        } else {
          this.highlight({
            type: HighlightType.FLOW,
            flow: object,
          });
        }
        break;
      }
      case PickingType.LOCATION: {
        if (!object) {
          this.highlight(undefined);
        } else {
          this.highlight({
            type: HighlightType.LOCATION,
            locationId: getLocationId!(object),
          });
        }
        break;
      }
      case PickingType.LOCATION_AREA: {
        this.highlight(undefined);
        break;
      }
    }
  };

  private handleFlowMapClick = ({ type, object }: FlowLayerPickingInfo) => {
    switch (type) {
      case PickingType.LOCATION:
      // fall through
      case PickingType.LOCATION_AREA: {
        if (object) {
          this.setState(state => ({
            ...state,
            selectedLocationIds: [getLocationId!(object)],
          }));
        }
        break;
      }
    }
  };

  private handleKeyDown = (evt: Event) => {
    if (evt instanceof KeyboardEvent && evt.key === 'Escape') {
      this.setState({
        selectedLocationIds: undefined,
        highlight: undefined,
      })
    }
  }

  render() {
    const { flows, spreadSheetKey } = this.props
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
          <LegendBox bottom={22} right={0}>
            <a
              href={`https://docs.google.com/spreadsheets/d/${spreadSheetKey}`}
              target="_blank"
              rel="noopener"
            >
              Data source
            </a>
          </LegendBox>
          <LegendBox bottom={35} left={0}>
            <div style={{ textAlign: 'center', marginBottom: 7 }}><b>Location totals</b></div>
            <LocationTotalsLegend colors={colors} />
          </LegendBox>
        </>}
        <div style={{ position: 'absolute', left: 15, top: 15 }}>
          <Title fontSize={25} />
        </div>
      </>
    )
  }
}


export default withFetchSheets(['locations', 'flows'])(FlowMap as any)
