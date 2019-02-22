import DeckGL, { MapController } from 'deck.gl'
import * as React from 'react'
import {
  NavigationControl,
  StaticMap,
  ViewportProps,
  ViewState,
  ViewStateChangeInfo
} from 'react-map-gl'
import FlowMapLayer, {
  FlowLayerPickingInfo,
  FlowPickingInfo,
  LocationPickingInfo,
  PickingType
} from '@flowmap.gl/core'
import { Intent, Switch } from '@blueprintjs/core'
import { getViewStateForLocations, LocationTotalsLegend } from '@flowmap.gl/react'
import WebMercatorViewport from 'viewport-mercator-project'
import { createSelector, ParametricSelector } from 'reselect'
import { animatedColors, colors, diffColors } from './colors'
import { Box, Column, LegendTitle, Title, TitleBox, ToastContent } from './Boxes'
import { findDOMNode } from 'react-dom';
import { FlowTooltipContent, LocationTooltipContent, formatCount } from './TooltipContent';
import Tooltip, { Props as TooltipProps, TargetBounds } from './Tooltip';
import { Link } from 'react-router-dom';
import Collapsible, { Direction } from './Collapsible';
import { Config, ConfigPropName, Flow, Location } from './types';
import sheetFetcher, { makeSheetQueryUrl } from './sheetFetcher';
import Message from './Message';
import LoadingSpinner from './LoadingSpinner';
import { PromiseState } from 'react-refetch';
import NoScrollContainer from './NoScrollContainer';
import styled from '@emotion/styled';
import sendEvent from './ga';
import { viewport } from '@mapbox/geo-viewport';
import { SyntheticEvent } from 'react';
import { AppToaster } from './toaster';
import { IconNames } from '@blueprintjs/icons';
import debounce from 'lodash.debounce';
import LocationsSearchBox from './LocationSearchBox';

const CONTROLLER_OPTIONS = {
  type: MapController,
  dragRotate: false,
  touchRotate: false,
}

const MAX_ZOOM_LEVELS = 5
const MIN_ZOOM_LEVELS = 0.5

type Props = {
  config: Config
  locationsFetch: PromiseState<Location[]>,
  flowsFetch: PromiseState<Flow[]>,
  spreadSheetKey: string
}

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
  viewState: ViewState | ViewportProps
  lastLocations: Location[] | undefined
  tooltip?: TooltipProps
  highlight?: Highlight
  selectedLocationIds?: string[]
  error?: string
  maxZoom: number | undefined
  minZoom: number | undefined
  time: number
  animate: boolean
}

export const getFlowMagnitude = (flow: Flow) => +flow.count
const getFlowOriginId = (flow: Flow) => flow.origin
const getFlowDestId = (flow: Flow) => flow.dest
const getLocationId = (loc: Location) => loc.id
const getLocationCentroid = (location: Location): [number, number] => [+location.lon, +location.lat]

const getInitialViewState = (bbox: [number, number, number, number]) => {
  const { center: [longitude, latitude], zoom } =
    viewport(
      bbox,
      [window.innerWidth, window.innerHeight],
      undefined, undefined, 512, true
    )
  return {
    longitude,
    latitude,
    zoom,
    bearing: 0,
    pitch: 0,
  }
}

const initialViewState = getInitialViewState([ -180, -70, 180, 70 ]);


const Outer = styled(NoScrollContainer)`
  background: #f5f5f5;
`
const ZoomControls = styled(NavigationControl)`
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
`
const StyledSwitch = styled(Switch)`
  margin-bottom: 0;
  align-self: flex-start;
`

type Selector<T> = ParametricSelector<State, Props, T>

class FlowMap extends React.Component<Props, State> {
  readonly state: State = {
    viewState: initialViewState,
    lastLocations: undefined,
    error: undefined,
    maxZoom: undefined,
    minZoom: undefined,
    time: 0,
    animate: false,
  }

  private flowMapLayer: FlowMapLayer | undefined = undefined

  getFlows = (state: State, props: Props) => props.flowsFetch.value
  getLocations = (state: State, props: Props) => props.locationsFetch.value

  getKnownLocationIds: Selector<Set<string> | undefined> = createSelector(
    this.getLocations,
    locations => locations ? new Set(locations.map(getLocationId)) : undefined
  )

  getDiffMode: Selector<boolean> = createSelector(
    this.getFlows,
    flows => {
      if (flows && flows.find(f => getFlowMagnitude(f) < 0)) {
        return true
      }
      return false
    }
  )

  getAnimate: Selector<boolean> = (state: State, props: Props) => state.animate

  getColors = createSelector(
    this.getDiffMode,
    this.getAnimate,
    (diffMode, animate) => {
      if (diffMode) {
        return diffColors
      }
      if (animate) {
        return animatedColors
      }
      return colors
    }
  )

  getFlowsForKnownLocations: Selector<Flow[] | undefined> = createSelector(
    this.getFlows,
    this.getKnownLocationIds,
    (flows, ids) => {
      if (!ids || !flows) return undefined
      return flows.filter(flow =>
        ids.has(getFlowOriginId(flow)) &&
        ids.has(getFlowDestId(flow))
      )
    }
  )

  getLocationsWithFlows: Selector<Location[] | undefined> = createSelector(
    this.getFlowsForKnownLocations,
    this.getLocations,
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

  getUnknownLocations: Selector<Set<string> | undefined> = createSelector(
    this.getKnownLocationIds,
    this.getFlows,
    this.getFlowsForKnownLocations,
    (ids, flows, flowsForKnownLocations) => {
      if (!ids || !flows) return undefined
      if (flowsForKnownLocations && flows.length === flowsForKnownLocations.length) return undefined
      const missing = new Set()
      for (const flow of flows) {
        if (!ids.has(getFlowOriginId(flow))) missing.add(getFlowOriginId(flow))
        if (!ids.has(getFlowDestId(flow))) missing.add(getFlowDestId(flow))
      }
      return missing
    }
  )

  getLayers() {
    const { highlight, selectedLocationIds, animate, time  } = this.state;
    const flows = this.getFlowsForKnownLocations(this.state, this.props)
    const locations = this.getLocationsWithFlows(this.state, this.props)
    const layers = []
    if (locations && flows) {
      layers.push(
        this.flowMapLayer = new FlowMapLayer({
          id: `flow-map-${animate ? 'animated' : 'arrows'}`,
          animate,
          animationCurrentTime: time,
          diffMode: this.getDiffMode(this.state, this.props),
          colors: this.getColors(this.state, this.props),
          locations,
          flows,
          showOnlyTopFlows: 10000,
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
          onHover: this.handleHover,
          onClick: this.handleClick,
        }),
      )
    }
    return layers
  }

  static getDerivedStateFromProps(props: Props, state: State): Partial<State> | null {
    const locations = props.locationsFetch.value
    if (locations != null && locations !== state.lastLocations) {
      let viewState

      const bbox = props.config[ConfigPropName.MAP_BBOX]
      if (bbox) {
        const bounds: number[] = bbox.split(',').map(d => +d)
        if (bounds.length === 4) {
          viewState = getInitialViewState(bounds as [number, number, number, number])
        }
      }

      if (!viewState) {
        viewState = getViewStateForLocations(
          locations,
          getLocationCentroid,
          [
            window.innerWidth,
            window.innerHeight,
          ],
          { pad: 0.05 }
        )
      }

      // if (!viewState.zoom) {
      //   return {
      //     error: `The geo bounding box couldn't be calculated.
      //     Please, make sure that all the locations have valid coordinates in the spreadsheet.`
      //   }
      // }
      if (!viewState.zoom) {
        viewState = {
          zoom: 1,
          latitude: 0,
          longitude: 0,
        }
      }
      return {
        lastLocations: locations,
        // maxZoom: viewState.zoom + MAX_ZOOM_LEVELS,
        // minZoom: viewState.zoom - MIN_ZOOM_LEVELS,
        viewState: {
          ...viewState,
          minPitch: 0,
          maxPitch: 0,
          bearing: 0,
          pitch: 0,
          // transitionDuration: 2000,
          // transitionInterpolator: new FlyToInterpolator(),
          // transitionEasing: d3ease.easeCubic,
        }
      }
    }

    return null
  }

  getContainerClientRect = () => {
    const container = findDOMNode(this) as Element
    if (!container) return undefined
    return container.getBoundingClientRect()
  }

  getMercator = () => {
    const containerBounds = this.getContainerClientRect()
    if (!containerBounds) return undefined
    const { width, height } = containerBounds
    return new WebMercatorViewport({
      ...this.state.viewState,
      width, height,
    })
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyDown)
    const { animate } = this.state;
    if (animate) {
      this.animate();
    }
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    const { flowsFetch, locationsFetch } = this.props
    if (flowsFetch.value !== prevProps.flowsFetch.value ||
      locationsFetch.value !== prevProps.locationsFetch.value
    ) {
      const unknownLocations = this.getUnknownLocations(this.state, this.props);
      if (unknownLocations) {
        if (this.props.config[ConfigPropName.IGNORE_ERRORS] !== 'yes') {
          const allFlows = this.getFlows(this.state, this.props)
          const flows = this.getFlowsForKnownLocations(this.state, this.props)
          const Locations = styled.div`
            font-size: 10px;
            padding: 10px;          
          `
          if (flows && allFlows)  {
            const ids = Array.from(unknownLocations).sort();
            const MAX_NUM_IDS = 100;
            AppToaster.show({
              intent: Intent.DANGER,
              icon: IconNames.WARNING_SIGN,
              timeout: 0,
              message:
              <ToastContent>
                Locations with the following IDs couldn't be found in the locations sheet:
                <Locations>
                  {(ids.length > MAX_NUM_IDS ?
                    ids.slice(0, MAX_NUM_IDS) : ids).map(id => `${id}`).join(', ')
                  }
                  {ids.length > MAX_NUM_IDS && `… and ${ids.length - MAX_NUM_IDS} others`}
                </Locations>
                {formatCount(allFlows.length - flows.length)} flows were omitted.
              </ToastContent>
            })
          }
        }


      }
    }
  }

  private animationFrame: number = -1;

  handleToggleAnimation = (evt: SyntheticEvent) => {
    const animate = (evt.target as HTMLInputElement).checked
    if (animate) {
      this.animate()
    } else {
      this.stopAnimation()
    }
    this.setState({ animate })
  }

  private animate = () => {
    const loopLength = 1800
    const animationSpeed = 30
    const timestamp = Date.now() / 1000
    const loopTime = loopLength / animationSpeed

    this.setState({
      time: ((timestamp % loopTime) / loopTime) * loopLength,
    })
    this.animationFrame = window.requestAnimationFrame(this.animate)
  }

  private stopAnimation() {
    if (this.animationFrame > 0) {
      window.cancelAnimationFrame(this.animationFrame)
      this.animationFrame = -1
    }
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown)
  }

  hideTooltip = () => {
    this.setState({
      tooltip: undefined
    })
  }

  showFlowTooltip = (pos: [number, number], info: FlowPickingInfo) => {
    const [x, y] = pos
    const { flowMapLayer } = this
    if (!flowMapLayer) return
    const r = 5
    this.showTooltip(
      {
        left: x - r,
        top: y - r,
        width: r * 2,
        height: r * 2,
      },
      <FlowTooltipContent
        flow={info.object}
        origin={info.origin}
        dest={(info as any).dest}
      />
    )
  }

  showLocationTooltip = (info: LocationPickingInfo) => {
    const { object: location, circleRadius } = info
    const mercator = this.getMercator()
    if (!mercator) return
    const [x, y] = mercator.project(getLocationCentroid(location))
    const { flowMapLayer } = this
    if (!flowMapLayer) return
    const r = circleRadius + 5
    const { selectedLocationIds } = this.state
    this.showTooltip(
      {
        left: x - r,
        top: y - r,
        width: r * 2,
        height: r * 2,
      },
      <LocationTooltipContent
        locationInfo={info}
        isSelected={selectedLocationIds != null && selectedLocationIds.indexOf(location.id) >= 0}
      />
    )
  }

  showTooltip = (bounds: TargetBounds, content: React.ReactNode) => {
    const containerBounds = this.getContainerClientRect()
    if (!containerBounds) return
    const { top, left } = containerBounds
    this.setState({
      tooltip: {
        target: {
          ...bounds,
          left: left + bounds.left,
          top: top + bounds.top,
        },
        placement: 'top',
        content,
      }
    })
  }

  handleViewStateChange = ({ viewState }: ViewStateChangeInfo) => {
    this.handleNavigation(viewState)
  }

  handleNavigation = (viewState: ViewState) => {
    const { maxZoom, minZoom } = this.state
    let zoom = viewState.zoom
    if (maxZoom && zoom > maxZoom) return
    if (minZoom && zoom < minZoom) return
    this.setState({
      viewState: {
        ...viewState,
        zoom,
      },
      tooltip: undefined,
      // highlight: undefined,
    })
  }

  private highlight(highlight: Highlight | undefined) {
    this.setState({ highlight })
    this.highlightDebounced.cancel()
  }
  private highlightDebounced = debounce(this.highlight, 100)

  private handleHover = (info: FlowLayerPickingInfo) => {
    const { type, object, x, y } = info
    switch (type) {
      case PickingType.FLOW: {
        if (object) {
          this.highlight({
            type: HighlightType.FLOW,
            flow: object,
          })
          this.showFlowTooltip(
            [x, y],
            info as FlowPickingInfo
          )
        } else {
          this.highlight(undefined);
          this.hideTooltip()
        }
        break
      }
      case PickingType.LOCATION: {
        if (object) {
          this.highlightDebounced({
            type: HighlightType.LOCATION,
            locationId: getLocationId!(object),
          })
          this.showLocationTooltip(info as LocationPickingInfo)
        } else {
          this.highlight(undefined);
          this.hideTooltip()
        }
        break
      }
      default: {
        this.highlight(undefined)
        this.hideTooltip()
      }
    }
  };

  private handleClick = (info: FlowLayerPickingInfo) => {
    switch (info.type) {
      case PickingType.LOCATION:
      // fall through
      case PickingType.LOCATION_AREA: {
        const { object } = info
        if (object) {
          this.setState(state => {
            const { selectedLocationIds } = state
            const locationId = getLocationId(object)
            return {
              ...state,
              ...(selectedLocationIds && selectedLocationIds.indexOf(locationId) >= 0 ? {
                selectedLocationIds: undefined,
                highlight: undefined,
              }: {
                selectedLocationIds: [locationId],
              }),
              tooltip: undefined,
            }
          })
          sendEvent(
            `${this.props.spreadSheetKey} "${this.props.config.title}"`,
            `Select location`,
            `Select location "${object.name}" in "${this.props.config.title}"`,
          )
        }
        break
      }
    }
  };

  private handleKeyDown = (evt: Event) => {
    if (evt instanceof KeyboardEvent && evt.key === 'Escape') {
      this.setState({
        selectedLocationIds: undefined,
        highlight: undefined,
        tooltip: undefined,
      })
    }
  }

  static getDerivedStateFromError(error: any) {
    return { error: error.toString() }
  }

  render() {
    const {
      config,
      spreadSheetKey,
      locationsFetch,
      flowsFetch,
    } = this.props
    const { viewState, tooltip, error } = this.state
    if (error)  {
      return <Message>Oops… There is a problem. <br/>{error}</Message>
    }
    if (locationsFetch.pending || locationsFetch.refreshing) {
      return <LoadingSpinner />
    }
    if (locationsFetch.rejected || flowsFetch.rejected) {
      return <Message>
        Oops… Couldn't fetch data from{` `}
        <a href={`https://docs.google.com/spreadsheets/d/${spreadSheetKey}`}>this spreadsheet</a>.
      </Message>;
    }
    const locations = this.getLocations(this.state, this.props)
    const flows = this.getFlowsForKnownLocations(this.state, this.props)
    const title = config[ConfigPropName.TITLE]
    const description = config[ConfigPropName.DESCRIPTION]
    const sourceUrl = config[ConfigPropName.SOURCE_URL]
    const sourceName = config[ConfigPropName.SOURCE_NAME]
    const mapboxAccessToken = config[ConfigPropName.MAPBOX_ACCESS_TOKEN]
    const diffMode = this.getDiffMode(this.state, this.props)

    return (
      <Outer>
        <DeckGL
          style={{ mixBlendMode: 'multiply' }}
          controller={CONTROLLER_OPTIONS}
          viewState={viewState}
          onViewStateChange={this.handleViewStateChange}
          layers={this.getLayers()}
          children={({ width, height, viewState }: any) => (
            mapboxAccessToken && <StaticMap
              mapboxApiAccessToken={mapboxAccessToken}
              width={width} height={height} viewState={viewState}
            >
               <ZoomControls
                 showCompass={false}
                 onViewportChange={this.handleNavigation}
               />
            </StaticMap>
          )}
        />
        {locations &&
          <Box top={10} right={50}>
            <LocationsSearchBox
              locations={locations}
              selectedLocations={undefined}
              onSelectionChanged={console.log}
            />
          </Box>
        }
        {flows &&
        <>
          <Box bottom={28} right={0}>
            <Collapsible
              width={160}
              direction={Direction.RIGHT}
            >
              <Column spacing={10} padding={12}>
                <LegendTitle>Location totals</LegendTitle>
                <LocationTotalsLegend
                  diff={diffMode}
                  colors={this.getColors(this.state, this.props)}
                />
              </Column>
            </Collapsible>
          </Box>
        </>}
        <TitleBox top={60} left={0}>
          <Collapsible
            width={300}
            direction={Direction.LEFT}
          >
            <Column spacing={10} padding={12}>
              {title &&
              <div>
                <Title>{title}</Title>
                {description}
              </div>
              }
              {sourceName && sourceUrl &&
              <div>
                {'Original data source: '}
                <>
                  <a href={sourceUrl} target="_blank" rel="noopener">{sourceName}</a>
                </>
              </div>}
              <div>
                {'Data behind this map is in '}
                <a href={`https://docs.google.com/spreadsheets/d/${spreadSheetKey}`}
                   target="_blank"
                   rel="noopener"
                >this spreadsheet</a>. You can <Link to="/">publish your own</Link> too.
              </div>
              <StyledSwitch
                checked={this.state.animate}
                label="Animate flows"
                onChange={this.handleToggleAnimation}
              />
            </Column>
          </Collapsible>
        </TitleBox>
        {tooltip && <Tooltip {...tooltip} />}
        {(flowsFetch.pending || flowsFetch.refreshing) &&
          <LoadingSpinner/>
        }
      </Outer>
    )
  }
}


export default sheetFetcher<any>(({ spreadSheetKey, config }: Props) => ({
  locationsFetch: {
    url: makeSheetQueryUrl(spreadSheetKey, 'locations', 'SELECT A,B,C,D'),
  },
  flowsFetch: {
    url: makeSheetQueryUrl(spreadSheetKey, 'flows', 'SELECT A,B,C'),
  },
}))(FlowMap as any);
