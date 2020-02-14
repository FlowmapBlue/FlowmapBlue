import { DeckGL } from '@deck.gl/react';
import { MapController } from '@deck.gl/core';
import * as React from 'react';
import {
  ReactNode,
  Reducer,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import { alea } from 'seedrandom';
import { _MapContext as MapContext, StaticMap, ViewStateChangeInfo } from 'react-map-gl';
import FlowMapLayer, {
  FlowLayerPickingInfo,
  FlowPickingInfo,
  LocationPickingInfo,
  PickingType,
} from '@flowmap.gl/core';
import { Button, ButtonGroup, Classes, Colors, Intent } from '@blueprintjs/core';
import { getViewStateForLocations, LocationTotalsLegend } from '@flowmap.gl/react';
import WebMercatorViewport from 'viewport-mercator-project';
import {
  Absolute,
  Box,
  Column,
  Description,
  LegendTitle,
  StyledBox,
  Title,
  TitleBox,
  ToastContent,
} from './Boxes';
import { FlowTooltipContent, formatCount, LocationTooltipContent } from './TooltipContent';
import Tooltip, { TargetBounds } from './Tooltip';
import { Link, useHistory } from 'react-router-dom';
import Collapsible, { Direction } from './Collapsible';
import {
  Config,
  ConfigPropName,
  Flow,
  getFlowDestId,
  getFlowMagnitude,
  getFlowOriginId,
  getLocationCentroid,
  getLocationId,
  Location,
} from './types';
import Message from './Message';
import LoadingSpinner from './LoadingSpinner';
import { PromiseState } from 'react-refetch';
import NoScrollContainer from './NoScrollContainer';
import styled from '@emotion/styled';
import { IconNames } from '@blueprintjs/icons';
import LocationsSearchBox from './LocationSearchBox';
import Away from './Away';
import {
  Action,
  ActionType,
  getInitialState,
  Highlight,
  HighlightType,
  mapTransition,
  MAX_PITCH,
  MAX_ZOOM_LEVEL,
  MIN_PITCH,
  MIN_ZOOM_LEVEL,
  reducer,
  State,
  stateToQueryString,
} from './FlowMap.state';
import {
  getClusterIndex,
  getClusterZoom,
  getDarkMode,
  getDiffMode,
  getExpandedSelection,
  getFetchedFlows,
  getFlowMapColors,
  getFlowsForFlowMapLayer,
  getInvalidLocationIds,
  getLocations,
  getLocationsForFlowMapLayer,
  getLocationsForSearchBox,
  getLocationsHavingFlows,
  getMapboxMapStyle,
  getMaxLocationCircleSize,
  getSortedFlowsForKnownLocations,
  getUnknownLocations,
  NUMBER_OF_FLOWS_TO_DISPLAY,
} from './FlowMap.selectors';
import { AppToaster } from './AppToaster';
import useDebounced from './hooks';
import SharePopover from './SharePopover';
import SettingsPopover from './SettingsPopover';

const CONTROLLER_OPTIONS = {
  type: MapController,
  dragRotate: true,
  touchRotate: true,
  minZoom: MIN_ZOOM_LEVEL,
  maxZoom: MAX_ZOOM_LEVEL,
};

export type Props = {
  inBrowser: boolean;
  embed?: boolean;
  config: Config;
  locationsFetch: PromiseState<Location[]>;
  flowsFetch: PromiseState<Flow[]>;
  spreadSheetKey: string | undefined;
};

/* This is temporary until mixBlendMode style prop works in <DeckGL> as before v8 */
const DeckGLOuter = styled.div<{ darkMode: boolean; baseMapOpacity: number }>(
  props => `
  & #deckgl-overlay {
    mix-blend-mode: ${props.darkMode ? 'screen' : 'multiply'};
  }
  & .mapboxgl-map {
    opacity: ${props.baseMapOpacity}
  }
`
);

export const ErrorsLocationsBlock = styled.div`
  font-size: 8px;
  padding: 10px;
  max-height: 100px;
  overflow: auto;
`;

export const MAX_NUM_OF_IDS_IN_ERROR = 100;

const FlowMap: React.FC<Props> = props => {
  const { inBrowser, embed, config, spreadSheetKey, locationsFetch, flowsFetch } = props;

  const history = useHistory();
  const initialState = useMemo<State>(() => getInitialState(config, history.location.search), [
    config,
    history.location.search,
  ]);

  const outerRef = useRef<HTMLDivElement>(null);

  const [state, dispatch] = useReducer<Reducer<State, Action>>(reducer, initialState);

  const [updateQuerySearch] = useDebounced(
    () => {
      if (inBrowser) return;
      const locationSearch = `?${stateToQueryString(state)}`;
      if (locationSearch !== history.location.search) {
        history.replace({
          ...history.location, // keep location state for in-browser flowmap
          search: locationSearch,
        });
      }
    },
    250,
    [state, history.location.search]
  );
  useEffect(updateQuerySearch, [history, state]);

  const { viewport, tooltip, animationEnabled, baseMapEnabled } = state;
  const allFlows = getFetchedFlows(state, props);
  const allLocations = getLocations(state, props);
  const locationsHavingFlows = getLocationsHavingFlows(state, props);
  const locations = getLocationsForFlowMapLayer(state, props);
  const flows = getFlowsForFlowMapLayer(state, props);

  const handleKeyDown = (evt: Event) => {
    if (evt instanceof KeyboardEvent && evt.key === 'Escape') {
      dispatch({ type: ActionType.CLEAR_SELECTION });
    }
  };
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  });

  const [time, setTime] = useState(0);

  // Use useRef for mutable variables that we want to persist
  // without triggering a re-render on their change
  const requestAnimationFrameRef = useRef<number>();

  const animate = useCallback(
    (time: number) => {
      const loopLength = 1800;
      const animationSpeed = 20;
      const loopTime = loopLength / animationSpeed;
      const timestamp = time / 1000;
      setTime(((timestamp % loopTime) / loopTime) * loopLength);
      requestAnimationFrameRef.current = requestAnimationFrame(animate);
    },
    [requestAnimationFrameRef, setTime]
  );

  useEffect(() => {
    if (animationEnabled) {
      requestAnimationFrameRef.current = requestAnimationFrame(animate);
    } else {
      const animationFrame = requestAnimationFrameRef.current;
      if (animationFrame != null && animationFrame > 0) {
        window.cancelAnimationFrame(animationFrame);
        requestAnimationFrameRef.current = undefined;
      }
    }
    return () => {
      if (requestAnimationFrameRef.current != null) {
        cancelAnimationFrame(requestAnimationFrameRef.current);
      }
    };
  }, [animationEnabled, animate]);

  const showErrorToast = useCallback(
    (errorText: ReactNode) => {
      if (config[ConfigPropName.IGNORE_ERRORS] !== 'yes') {
        AppToaster.show({
          intent: Intent.WARNING,
          icon: IconNames.WARNING_SIGN,
          timeout: 0,
          message: <ToastContent>{errorText}</ToastContent>,
        });
      }
    },
    [config]
  );

  const invalidLocations = getInvalidLocationIds(state, props);
  useEffect(() => {
    if (invalidLocations) {
      showErrorToast(
        <>
          Locations with the following IDs have invalid coordinates:
          <ErrorsLocationsBlock>
            {(invalidLocations.length > MAX_NUM_OF_IDS_IN_ERROR
              ? invalidLocations.slice(0, MAX_NUM_OF_IDS_IN_ERROR)
              : invalidLocations
            )
              .map(id => `${id}`)
              .join(', ')}
            {invalidLocations.length > MAX_NUM_OF_IDS_IN_ERROR &&
              `… and ${invalidLocations.length - MAX_NUM_OF_IDS_IN_ERROR} others`}
          </ErrorsLocationsBlock>
          Make sure you named the columns "lat" and "lon" and didn't confuse latitudes and
          longitudes. The coordinates must be in decimal form. If your coordinates are in
          degrees-minutes-seconds (DSM format) you can convert them with{' '}
          <Away href="https://www.latlong.net/degrees-minutes-seconds-to-decimal-degrees">
            this tool
          </Away>{' '}
          for example.
        </>
      );
    }
  }, [invalidLocations, showErrorToast]);

  const unknownLocations = getUnknownLocations(state, props);
  const flowsForKnownLocations = getSortedFlowsForKnownLocations(state, props);
  useEffect(() => {
    if (unknownLocations) {
      if (flowsForKnownLocations && allFlows) {
        const ids = Array.from(unknownLocations).sort();
        showErrorToast(
          <>
            Locations with the following IDs couldn't be found in the locations sheet:
            <ErrorsLocationsBlock>
              {(ids.length > MAX_NUM_OF_IDS_IN_ERROR ? ids.slice(0, MAX_NUM_OF_IDS_IN_ERROR) : ids)
                .map(id => `${id}`)
                .join(', ')}
              {ids.length > MAX_NUM_OF_IDS_IN_ERROR &&
                `… and ${ids.length - MAX_NUM_OF_IDS_IN_ERROR} others`}
            </ErrorsLocationsBlock>
            {formatCount(allFlows.length - flowsForKnownLocations.length)} flows were omitted.
            {flowsForKnownLocations.length === 0 && (
              <div style={{ marginTop: '1em' }}>
                Make sure the columns are named header row in the flows sheet is correct. There must
                be <b>origin</b>, <b>dest</b>, and <b>count</b>.
              </div>
            )}
          </>
        );
      }
    }
  }, [unknownLocations, showErrorToast, allFlows, flowsForKnownLocations]);

  const { adjustViewportToLocations } = state;

  useEffect(() => {
    if (!adjustViewportToLocations) {
      return;
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    if (allLocations != null) {
      let draft = getViewStateForLocations(
        locationsHavingFlows ?? allLocations,
        getLocationCentroid,
        [width, height],
        { pad: 0.1 }
      );

      if (!draft.zoom) {
        draft = {
          zoom: 1,
          latitude: 0,
          longitude: 0,
        };
      }

      dispatch({
        type: ActionType.SET_VIEWPORT,
        viewport: {
          width,
          height,
          ...draft,
          minZoom: MIN_ZOOM_LEVEL,
          maxZoom: MAX_ZOOM_LEVEL,
          minPitch: MIN_PITCH,
          maxPitch: MAX_PITCH,
          bearing: 0,
          pitch: 0,
          altitude: 1.5,
          ...mapTransition(1000),
        },
      });
    }
  }, [allLocations, locationsHavingFlows, adjustViewportToLocations]);

  const getContainerClientRect = useCallback(() => {
    const container = outerRef.current;
    if (!container) return undefined;
    return container.getBoundingClientRect();
  }, [outerRef]);

  const getMercator = useCallback(() => {
    const containerBounds = getContainerClientRect();
    if (!containerBounds) return undefined;
    const { width, height } = containerBounds;
    return new WebMercatorViewport({
      ...viewport,
      width,
      height,
    });
  }, [viewport, getContainerClientRect]);

  const showTooltip = (bounds: TargetBounds, content: React.ReactNode) => {
    const containerBounds = getContainerClientRect();
    if (!containerBounds) return;
    const { top, left } = containerBounds;
    dispatch({
      type: ActionType.SET_TOOLTIP,
      tooltip: {
        target: {
          ...bounds,
          left: left + bounds.left,
          top: top + bounds.top,
        },
        placement: 'top',
        content,
      },
    });
  };

  const highlight = (highlight: Highlight | undefined) => {
    dispatch({ type: ActionType.SET_HIGHLIGHT, highlight });
  };
  const [showTooltipDebounced, cancelShowTooltipDebounced] = useDebounced(showTooltip, 500);
  const [highlightDebounced, cancelHighlightDebounced] = useDebounced(highlight, 500);

  const hideTooltip = () => {
    dispatch({
      type: ActionType.SET_TOOLTIP,
      tooltip: undefined,
    });
    cancelShowTooltipDebounced();
  };

  const showFlowTooltip = (pos: [number, number], info: FlowPickingInfo) => {
    const [x, y] = pos;
    const r = 5;
    const bounds = {
      left: x - r,
      top: y - r,
      width: r * 2,
      height: r * 2,
    };
    const content = <FlowTooltipContent flow={info.object} origin={info.origin} dest={info.dest} />;
    if (state.tooltip) {
      showTooltip(bounds, content);
      cancelShowTooltipDebounced();
    } else {
      showTooltipDebounced(bounds, content);
    }
  };

  const showLocationTooltip = (info: LocationPickingInfo) => {
    const { object: location, circleRadius } = info;
    const mercator = getMercator();
    if (!mercator) return;
    const [x, y] = mercator.project(getLocationCentroid(location));
    const r = circleRadius + 5;
    const { selectedLocations } = state;
    const bounds = {
      left: x - r,
      top: y - r,
      width: r * 2,
      height: r * 2,
    };
    const content = (
      <LocationTooltipContent
        locationInfo={info}
        isSelectionEmpty={!selectedLocations}
        isSelected={
          selectedLocations && selectedLocations.find(id => id === location.id) ? true : false
        }
      />
    );
    if (state.tooltip) {
      showTooltip(bounds, content);
      cancelShowTooltipDebounced();
    } else {
      showTooltipDebounced(bounds, content);
    }
  };

  const handleHover = (info: FlowLayerPickingInfo) => {
    const { type, object, x, y } = info;
    switch (type) {
      case PickingType.FLOW: {
        if (object) {
          highlight({
            type: HighlightType.FLOW,
            flow: object,
          });
          cancelHighlightDebounced();
          showFlowTooltip([x, y], info as FlowPickingInfo);
        } else {
          highlight(undefined);
          cancelHighlightDebounced();
          hideTooltip();
        }
        break;
      }
      case PickingType.LOCATION: {
        if (object) {
          highlightDebounced({
            type: HighlightType.LOCATION,
            locationId: getLocationId!(object),
          });
          showLocationTooltip(info as LocationPickingInfo);
        } else {
          highlight(undefined);
          cancelHighlightDebounced();
          hideTooltip();
        }
        break;
      }
      default: {
        highlight(undefined);
        cancelHighlightDebounced();
        hideTooltip();
      }
    }
  };

  if (locationsFetch.pending || locationsFetch.refreshing) {
    return <LoadingSpinner />;
  }
  if (locationsFetch.rejected || flowsFetch.rejected) {
    return (
      <Message>
        <p>
          Oops… Couldn't fetch data from{` `}
          <a href={`https://docs.google.com/spreadsheets/d/${spreadSheetKey}`}>this spreadsheet</a>.
          {` `}
        </p>
        <p>
          If you are the owner of this spreadsheet, make sure you have shared it by going to "File"
          / "Share with others", clicking "Advanced", and then choosing "Anyone with the link can
          view".
        </p>
      </Message>
    );
  }
  const searchBoxLocations = getLocationsForSearchBox(state, props);
  const title = config[ConfigPropName.TITLE];
  const description = config[ConfigPropName.DESCRIPTION];
  const sourceUrl = config[ConfigPropName.SOURCE_URL];
  const sourceName = config[ConfigPropName.SOURCE_NAME];
  const authorUrl = config[ConfigPropName.AUTHOR_URL];
  const authorName = config[ConfigPropName.AUTHOR_NAME];
  const mapboxAccessToken = config[ConfigPropName.MAPBOX_ACCESS_TOKEN];
  const diffMode = getDiffMode(state, props);
  const darkMode = getDarkMode(state, props);
  const mapboxMapStyle = getMapboxMapStyle(state, props);

  const getHighlightForZoom = () => {
    const { highlight, clusteringEnabled } = state;
    if (!highlight || !clusteringEnabled) {
      return highlight;
    }
    const clusterTree = getClusterIndex(state, props);
    const clusterZoom = getClusterZoom(state, props);
    if (!clusterTree || clusterZoom === undefined) {
      return undefined;
    }

    const isValidForClusterZoom = (itemId: string) => {
      const cluster = clusterTree.getClusterById(itemId);
      if (cluster) {
        return cluster.zoom === clusterZoom;
      } else {
        const minZoom = clusterTree.getMinZoomForLocation(itemId);
        if (minZoom === undefined || clusterZoom >= minZoom) {
          return true;
        }
      }
      return false;
    };

    switch (highlight.type) {
      case HighlightType.LOCATION:
        const { locationId } = highlight;
        return isValidForClusterZoom(locationId) ? highlight : undefined;

      case HighlightType.FLOW:
        const {
          flow: { origin, dest },
        } = highlight;
        if (isValidForClusterZoom(origin) && isValidForClusterZoom(dest)) {
          return highlight;
        }
        return undefined;
    }

    return undefined;
  };

  const handleClick = (info: FlowLayerPickingInfo, event: { srcEvent: MouseEvent }) => {
    switch (info.type) {
      case PickingType.LOCATION:
      // fall through
      case PickingType.LOCATION_AREA: {
        const { object } = info;
        if (object) {
          dispatch({
            type: ActionType.SELECT_LOCATION,
            locationId: getLocationId(object),
            incremental: event.srcEvent.shiftKey,
          });
        }
        break;
      }
    }
  };

  const handleChangeSelectLocations = (selectedLocations: string[] | undefined) => {
    dispatch({
      type: ActionType.SET_SELECTED_LOCATIONS,
      selectedLocations,
    });
  };

  const handleViewStateChange = ({ viewState }: ViewStateChangeInfo) => {
    dispatch({
      type: ActionType.SET_VIEWPORT,
      viewport: viewState,
    });
  };

  const handleZoomIn = () => {
    dispatch({ type: ActionType.ZOOM_IN });
  };

  const handleZoomOut = () => {
    dispatch({ type: ActionType.ZOOM_OUT });
  };

  const handleResetBearingPitch = () => {
    dispatch({ type: ActionType.RESET_BEARING_PITCH });
  };

  const handleFullScreen = () => {
    const outer = outerRef.current;
    if (outer) {
      if (outer.requestFullscreen) {
        outer.requestFullscreen();
      } else if ((outer as any).webkitRequestFullscreen) {
        (outer as any).webkitRequestFullscreen();
      }
    }
  };

  const getLayers = () => {
    const { animationEnabled, locationTotalsEnabled, darkMode, colorSchemeKey, fadeAmount } = state;
    const layers = [];
    if (locations && flows) {
      const id = [
        'flow-map',
        animationEnabled ? 'animated' : 'arrows',
        locationTotalsEnabled ? 'withTotals' : '',
        colorSchemeKey,
        darkMode ? 'dark' : 'light',
        fadeAmount,
      ].join('-');

      const highlight = getHighlightForZoom();
      layers.push(
        new FlowMapLayer({
          id,
          animate: animationEnabled,
          animationCurrentTime: time,
          diffMode: getDiffMode(state, props),
          colors: getFlowMapColors(state, props),
          locations,
          flows,
          showOnlyTopFlows: NUMBER_OF_FLOWS_TO_DISPLAY,
          getLocationCentroid,
          getFlowMagnitude,
          getFlowOriginId,
          getFlowDestId,
          getLocationId,
          getAnimatedFlowLineStaggering: (d: Flow) =>
            // @ts-ignore
            new alea(`${d.origin}-${d.dest}`)(),
          showTotals: true,
          maxLocationCircleSize: getMaxLocationCircleSize(state, props),
          maxFlowThickness: animationEnabled ? 18 : 12,
          selectedLocationIds: getExpandedSelection(state, props),
          highlightedLocationId:
            highlight && highlight.type === HighlightType.LOCATION
              ? highlight.locationId
              : undefined,
          highlightedFlow:
            highlight && highlight.type === HighlightType.FLOW ? highlight.flow : undefined,
          pickable: true,
          onHover: handleHover,
          onClick: handleClick as any,
          visible: true,
          updateTriggers: {
            onHover: handleHover, // to avoid stale closure in the handler
            onClick: handleClick,
          } as any,
        })
      );
    }

    return layers;
  };

  return (
    <NoScrollContainer
      ref={outerRef}
      onMouseLeave={hideTooltip}
      className={darkMode ? Classes.DARK : undefined}
      style={{
        background: darkMode ? Colors.DARK_GRAY1 : Colors.LIGHT_GRAY5,
      }}
    >
      <DeckGLOuter darkMode={darkMode} baseMapOpacity={state.baseMapOpacity / 100}>
        <DeckGL
          controller={CONTROLLER_OPTIONS}
          viewState={viewport}
          onViewStateChange={handleViewStateChange}
          layers={getLayers()}
          ContextProvider={MapContext.Provider}
          parameters={{
            clearColor: darkMode ? [0, 0, 0, 1] : [255, 255, 255, 1],
          }}
        >
          {' '}
          {mapboxAccessToken && baseMapEnabled && (
            <StaticMap
              mapboxApiAccessToken={mapboxAccessToken}
              mapStyle={mapboxMapStyle}
              width="100%"
              height="100%"
            />
          )}
        </DeckGL>
      </DeckGLOuter>
      {flows && (
        <>
          {searchBoxLocations && (
            <Absolute top={10} right={50}>
              <StyledBox darkMode={darkMode}>
                <LocationsSearchBox
                  locations={searchBoxLocations}
                  selectedLocations={state.selectedLocations}
                  onSelectionChanged={handleChangeSelectLocations}
                />
              </StyledBox>
            </Absolute>
          )}
          <Absolute top={10} right={10}>
            <Column spacing={10}>
              <ButtonGroup vertical={true}>
                <Button title="Zoom in" icon={IconNames.PLUS} onClick={handleZoomIn} />
                <Button title="Zoom out" icon={IconNames.MINUS} onClick={handleZoomOut} />
                <Button
                  title="Reset bearing and pitch"
                  icon={IconNames.COMPASS}
                  onClick={handleResetBearingPitch}
                />
              </ButtonGroup>
              {!inBrowser && !embed && (
                <ButtonGroup vertical={true}>
                  <SharePopover>
                    <Button title="Share…" icon={IconNames.SHARE} />
                  </SharePopover>
                </ButtonGroup>
              )}
            </Column>
          </Absolute>
          {state.locationTotalsEnabled && !embed && (
            <Box bottom={28} right={0} darkMode={darkMode}>
              <Collapsible darkMode={darkMode} width={160} direction={Direction.RIGHT}>
                <Column spacing={10} padding={12}>
                  <LegendTitle>Location totals</LegendTitle>
                  <LocationTotalsLegend diff={diffMode} colors={getFlowMapColors(state, props)} />
                </Column>
              </Collapsible>
            </Box>
          )}
        </>
      )}
      {!embed && (
        <Absolute bottom={40} left={10}>
          <SettingsPopover darkMode={darkMode} state={state} dispatch={dispatch} />
        </Absolute>
      )}
      {embed && (
        <Absolute bottom={30} right={10}>
          <Button
            title="Open in full-screen mode"
            onClick={handleFullScreen}
            icon={IconNames.FULLSCREEN}
          />
        </Absolute>
      )}
      {spreadSheetKey && !embed && (
        <TitleBox top={60} left={0} darkMode={darkMode}>
          <Collapsible darkMode={darkMode} width={300} direction={Direction.LEFT}>
            <Column spacing={10} padding="12px 20px">
              {title && (
                <div>
                  <Title>{title}</Title>
                  <Description>{description}</Description>
                </div>
              )}
              {authorUrl ? (
                <div>
                  {`Created by: `}
                  <Away href={`${authorUrl.indexOf('://') < 0 ? 'http://' : ''}${authorUrl}`}>
                    {authorName || 'Author'}
                  </Away>
                </div>
              ) : authorName ? (
                <div>Created by: {authorName}</div>
              ) : null}
              {sourceName && sourceUrl && (
                <div>
                  {'Original data source: '}
                  <>
                    <Away href={`${sourceUrl.indexOf('://') < 0 ? 'http://' : ''}${sourceUrl}`}>
                      {sourceName}
                    </Away>
                  </>
                </div>
              )}
              <div>
                {'Data behind this map is in '}
                <Away href={`https://docs.google.com/spreadsheets/d/${spreadSheetKey}`}>
                  this spreadsheet
                </Away>
                . You can <Link to="/">publish your own</Link> too.
              </div>
            </Column>
          </Collapsible>
        </TitleBox>
      )}
      {tooltip && <Tooltip {...tooltip} />}
      {(flowsFetch.pending || flowsFetch.refreshing) && <LoadingSpinner />}
    </NoScrollContainer>
  );
};

export default FlowMap;
