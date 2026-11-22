import {DeckGL} from '@deck.gl/react';
import {MapView, MapViewState, Viewport} from '@deck.gl/core';
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
import {Map as ReactMapGl} from 'react-map-gl/mapbox-legacy';
import {FlowmapLayer, FlowmapLayerPickingInfo, PickingType} from '@flowmap.gl/layers';
import {getViewStateForLocations, type ScaleState} from '@flowmap.gl/data';
import FlowMapDataProvider, {flowmapAccessors} from './FlowMapDataProvider';
import ScaleLegend from './ScaleLegend';
import dynamic from 'next/dynamic';
import {
  Popover,
  Button,
  ButtonGroup,
  Classes,
  Colors,
  HTMLSelect,
  Intent,
  Icon,
  Position,
} from '@blueprintjs/core';
import {
  Absolute,
  Box,
  BoxStyle,
  Column,
  Description,
  Row,
  Title,
  TitleBox,
  ToastContent,
} from './Boxes';
import {FlowTooltipContent, formatCount, LocationTooltipContent} from './TooltipContent';
import Tooltip, {TargetBounds} from './Tooltip';
import Link from 'next/link';
import Collapsible, {Direction} from './Collapsible';
import isDeepEqual from 'fast-deep-equal';
import {AsyncState, Config, ConfigPropName, Flow, getLocationCentroid, Location} from './types';
import Message from './Message';
import LoadingSpinner from './LoadingSpinner';
import NoScrollContainer from './NoScrollContainer';
import styled from '@emotion/styled';
import {COLOR_SCHEMES, DEFAULT_COLOR_SCHEME} from './colors';
import {IconNames} from '@blueprintjs/icons';
import LocationsSearchBox from './LocationSearchBox';
import Away from './Away';
import {
  Action,
  ActionType,
  getInitialState,
  LocationFilterMode,
  mapTransition,
  MAX_PITCH,
  MAX_ZOOM_LEVEL,
  MIN_PITCH,
  MIN_ZOOM_LEVEL,
  reducer,
  State,
  stateToQueryParams,
} from './FlowMap.state';
import {
  getAvailableClusterZoomLevels,
  getClusterZoom,
  getDarkMode,
  getExpandedSelectedLocationsSet,
  getFetchedFlows,
  getFlowsSheets,
  getInvalidLocationIds,
  getLayerData,
  getLocations,
  getLocationsForSearchBox,
  getLocationsHavingFlows,
  getMapboxMapStyle,
  getSortedFlowsForKnownLocations,
  getTimeExtent,
  getTimeGranularity,
  getTotalCountsByTime,
  getTotalFilteredCount,
  getTotalUnfilteredCount,
  getUnknownLocations,
  NUMBER_OF_FLOWS_TO_DISPLAY,
} from './FlowMap.selectors';
import AppToaster from './AppToaster';
import useDebounced from './hooks';
import SharePopover from './SharePopover';
import SettingsPopover from './SettingsPopover';
import Timeline from './Timeline';
import {TimeGranularity} from './time';
import {useRouter} from 'next/router';
import {SPREADSHEET_KEY_RE, getFlowsSheetKey, makeGSheetsMapUrl} from '../components/constants';

const GlobeMap = dynamic(() => import('./GlobeMap'), {ssr: false});

const FLAT_VIEW = new MapView({id: 'map', repeat: true});
const CONTROLLER_OPTIONS = {
  doubleClickZoom: false,
  dragRotate: true,
  touchRotate: true,
  minZoom: MIN_ZOOM_LEVEL,
  maxZoom: MAX_ZOOM_LEVEL,
};

export type Props = {
  inBrowser: boolean;
  embed?: boolean;
  config: Config;
  locationsFetch: AsyncState<Location[]>;
  flowsFetch: AsyncState<Flow[]>;
  spreadSheetKey: string | undefined;
  flowsSheet: string | undefined;
  onSetFlowsSheet?: (sheet: string) => void;
};

const DeckGLOuter = styled.div<{
  darkMode: boolean;
  baseMapOpacity: number;
}>(
  ({baseMapOpacity, darkMode}) => `
  position: absolute;
  inset: 0;
  isolation: isolate;
  background: ${darkMode ? Colors.DARK_GRAY1 : Colors.LIGHT_GRAY5};
  /* MapLibre mounts the deck canvas in this control corner. Let it blend with the basemap. */
  & .maplibregl-ctrl-top-left {
    z-index: auto;
  }
  & #deckgl-overlay {
    mix-blend-mode: ${darkMode ? 'screen' : 'multiply'};
  }
  & .mapboxgl-map, & .maplibregl-canvas {
    opacity: ${baseMapOpacity}
  }
`,
);

export const ErrorsLocationsBlock = styled.div`
  font-size: 8px;
  padding: 10px;
  max-height: 100px;
  overflow: auto;
`;

const SelectedTimeRangeBox = styled(BoxStyle)<{darkMode: boolean}>((props) => ({
  display: 'flex',
  alignSelf: 'center',
  fontSize: 12,
  padding: '5px 10px',
  borderRadius: 5,
  backgroundColor: props.darkMode ? Colors.DARK_GRAY4 : Colors.LIGHT_GRAY4,
  textAlign: 'center',
}));

const TimelineBox = styled(BoxStyle)({
  minWidth: 400,
  display: 'block',
  boxShadow: '0 0 5px #aaa',
  borderTop: '1px solid #999',
});

const TotalCount = styled.div<{darkMode: boolean}>((props) => ({
  padding: 5,
  borderRadius: 5,
  backgroundColor: props.darkMode ? Colors.DARK_GRAY4 : Colors.LIGHT_GRAY4,
  textAlign: 'center',
}));

const FlowmapCityLinkArea = styled.div<{darkMode: boolean}>(
  (props) => `
  display: flex;
  justify-content: center;
  
`,
);

const FlowmapCityPopoverContent = styled.div<{darkMode: boolean}>(
  (props) => `
  font-size: 12px;
  max-width: 260px;
  padding: 10px;
  ul > li {
    margin-bottom: 5px;
  }
  background: ${props.darkMode ? Colors.BLUE1 : Colors.WHITE};
  a { color: ${props.darkMode ? Colors.BLUE5 : Colors.BLUE3}; }
  border-radius: 5px;
`,
);
export const MAX_NUM_OF_IDS_IN_ERROR = 100;

const StyledFlowmapCityLink = styled.a<{darkMode: boolean}>(
  (props) => `
  color: ${props.darkMode ? Colors.BLUE5 : Colors.BLUE3};
  font-size: 12px;

  div > span {
    color: ${props.darkMode ? Colors.BLUE5 : Colors.BLUE3};
  }

  &:hover {
    div > span {
      text-decoration: underline;
    }
  }
`,
);

function getFlowmapCityUrl() {
  const m = new RegExp(`^\/(${SPREADSHEET_KEY_RE})`).exec(location.pathname);
  if (m && m.length > 0) {
    return `https://app.flowmap.city/import/FlowmapBlue/${m[1]}${location.search}`;
  }
}

const FlowmapCityLink: React.FC<{darkMode: boolean; children: ReactNode}> = ({
  darkMode,
  children,
}) => (
  <StyledFlowmapCityLink
    darkMode={darkMode}
    className={[Classes.MINIMAL, Classes.SMALL, Classes.INTENT_PRIMARY].join(' ')}
    href={getFlowmapCityUrl()}
    target="_blank"
    rel="noopener noreferrer"
  >
    {children}
  </StyledFlowmapCityLink>
);

const FlowMap: React.FC<Props> = (props) => {
  const {inBrowser, embed, config, spreadSheetKey, flowsSheet, locationsFetch, flowsFetch} = props;
  const router = useRouter();
  const initialState = useMemo<State>(() => getInitialState(config, router.query), [config]);

  const outerRef = useRef<HTMLDivElement>(null);

  const [state, dispatch] = useReducer<Reducer<State, Action>>(reducer, initialState);
  const {selectedTimeRange} = state;

  const timeGranularity = getTimeGranularity(state, props);
  const timeExtent = getTimeExtent(state, props);
  const totalCountsByTime = getTotalCountsByTime(state, props);
  const totalFilteredCount = getTotalFilteredCount(state, props);
  const totalUnfilteredCount = getTotalUnfilteredCount(state, props);

  useEffect(() => {
    if (timeExtent) {
      if (
        !selectedTimeRange ||
        // reset selectedTimeRange if not within the timeExtent
        !(timeExtent[0] <= selectedTimeRange[0] && selectedTimeRange[1] <= timeExtent[1])
      ) {
        dispatch({
          type: ActionType.SET_TIME_RANGE,
          range: timeExtent,
        });
      }
    }
  }, [timeExtent, selectedTimeRange]);

  const [updateQuerySearch] = useDebounced(
    () => {
      if (!spreadSheetKey && router.pathname !== '/from-url') return;
      const queryParams = stateToQueryParams(state);
      if (router.pathname === '/from-url') {
        const {fs, ls, ...query} = router.query;
        if (fs !== queryParams.fs || ls !== queryParams.ls) {
          if (queryParams.fs != null) query.fs = queryParams.fs;
          if (queryParams.ls != null) query.ls = queryParams.ls;
          router.replace({pathname: router.pathname, query}, undefined, {shallow: true});
        }
        return;
      }
      if (!spreadSheetKey) return;
      const query = {
        ...queryParams,
        ...(spreadSheetKey ? {id: spreadSheetKey} : {}),
        ...(flowsSheet ? {sheet: getFlowsSheetKey(flowsSheet)} : {}),
      };
      if (!isDeepEqual(query, router.query)) {
        router.replace(makeGSheetsMapUrl(spreadSheetKey, flowsSheet, embed, queryParams));
      }
    },
    250,
    [state, router.asPath],
  );
  useEffect(updateQuerySearch, [router.asPath, state]);

  const {viewport, tooltip, flowLinesRenderingMode, flowLineCurviness, baseMapEnabled} = state;
  const allFlows = getFetchedFlows(state, props);
  const allLocations = getLocations(state, props);
  const locationsHavingFlows = getLocationsHavingFlows(state, props);
  const layerData = getLayerData(state, props);
  const dataProvider = useMemo(
    () =>
      layerData.locations?.length && layerData.flows?.length
        ? new FlowMapDataProvider(layerData)
        : undefined,
    [layerData],
  );
  const [scaleState, setScaleState] = useState<ScaleState>();
  const {lockedScaleDomains: lockedDomains} = state;
  const handleScaleChange = useCallback((scale: ScaleState | undefined) => {
    setScaleState((previous) => (isDeepEqual(previous, scale) ? previous : scale));
  }, []);
  const clusterZoom = getClusterZoom(state, props);
  const expandedSelection = getExpandedSelectedLocationsSet(state, props);
  const layerFilter = useMemo(
    () => ({
      selectedLocations:
        clusterZoom == null && expandedSelection
          ? Array.from(expandedSelection)
          : state.selectedLocations,
      locationFilterMode: state.locationFilterMode,
    }),
    [clusterZoom, expandedSelection, state.selectedLocations, state.locationFilterMode],
  );
  const darkMode = getDarkMode(state, props);
  const colorScheme = useMemo(() => {
    const scheme =
      (state.colorSchemeKey && COLOR_SCHEMES[state.colorSchemeKey]) || DEFAULT_COLOR_SCHEME;
    return darkMode ? scheme.slice().reverse() : scheme;
  }, [state.colorSchemeKey, darkMode]);
  const flowsSheets = getFlowsSheets(config);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') hideTooltip();
    }
    globalThis.addEventListener('keydown', handleKeyDown);
    return () => globalThis.removeEventListener('keydown', handleKeyDown);
  });

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
    [config],
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
              .map((id) => `${id}`)
              .join(', ')}
            {invalidLocations.length > MAX_NUM_OF_IDS_IN_ERROR &&
              `… and ${invalidLocations.length - MAX_NUM_OF_IDS_IN_ERROR} others`}
          </ErrorsLocationsBlock>
          Make sure you named the columns &quot;lat&quot; and &quot;lon&quot; and did not confuse
          latitudes and longitudes. The coordinates must be in decimal form. If your coordinates are
          in degrees-minutes-seconds (DSM format) you can convert them with{' '}
          <Away href="https://www.latlong.net/degrees-minutes-seconds-to-decimal-degrees">
            this tool
          </Away>{' '}
          for example.
        </>,
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
            Locations with the following IDs could not be found in the locations sheet:
            <ErrorsLocationsBlock>
              {(ids.length > MAX_NUM_OF_IDS_IN_ERROR ? ids.slice(0, MAX_NUM_OF_IDS_IN_ERROR) : ids)
                .map((id) => `${id}`)
                .join(', ')}
              {ids.length > MAX_NUM_OF_IDS_IN_ERROR &&
                `… and ${ids.length - MAX_NUM_OF_IDS_IN_ERROR} others`}
            </ErrorsLocationsBlock>
            {formatCount(allFlows.length - flowsForKnownLocations.length)} flows were omitted.
            {flowsForKnownLocations.length === 0 && (
              <div style={{marginTop: '1em'}}>
                Make sure the columns are named header row in the flows sheet is correct. There must
                be <b>origin</b>, <b>dest</b>, and <b>count</b>.
              </div>
            )}
          </>,
        );
      }
    }
  }, [unknownLocations, showErrorToast, allFlows, flowsForKnownLocations]);

  const {adjustViewportToLocations} = state;

  useEffect(() => {
    if (!adjustViewportToLocations) {
      return;
    }

    const width = globalThis.innerWidth;
    const height = globalThis.innerHeight;
    if (allLocations != null) {
      const locationsToFit = locationsHavingFlows?.length ? locationsHavingFlows : allLocations;
      const draft = locationsToFit.length
        ? getViewStateForLocations(locationsToFit, getLocationCentroid, [width, height], {pad: 0.1})
        : {zoom: 1, latitude: 0, longitude: 0};

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
          ...(!state.globe && mapTransition(500)),
        },
        adjustViewportToLocations: false,
      });
    }
  }, [allLocations, locationsHavingFlows, adjustViewportToLocations, state.globe]);

  const handleChangeClusteringAuto = (value: boolean) => {
    if (!value) {
      dispatch({type: ActionType.SET_MANUAL_CLUSTER_ZOOM, manualClusterZoom: clusterZoom});
    }
    dispatch({type: ActionType.SET_CLUSTERING_AUTO, clusteringAuto: value});
  };

  const [showFullscreenButton, setShowFullscreenButton] = useState(
    embed && document.fullscreenEnabled,
  );

  useEffect(() => {
    function handleFullScreenChange() {
      setShowFullscreenButton(embed && document.fullscreenEnabled && !document.fullscreenElement);
    }
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
  }, [setShowFullscreenButton]);

  const getContainerClientRect = useCallback(() => {
    const container = outerRef.current;
    if (!container) return undefined;
    return container.getBoundingClientRect();
  }, [outerRef]);

  const showTooltip = (bounds: TargetBounds, content: React.ReactNode) => {
    const containerBounds = getContainerClientRect();
    if (!containerBounds) return;
    const {top, left} = containerBounds;
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

  const [showTooltipDebounced, cancelShowTooltipDebounced] = useDebounced(showTooltip, 500);

  const hideTooltip = () => {
    dispatch({
      type: ActionType.SET_TOOLTIP,
      tooltip: undefined,
    });
    cancelShowTooltipDebounced();
  };

  const handleHover = (info: FlowmapLayerPickingInfo<Location, Flow> | undefined) => {
    const object = info?.object;
    if (!info || !object) {
      hideTooltip();
      return;
    }

    let {x, y} = info;
    let radius = 5;
    let content: ReactNode;
    if (object.type === PickingType.FLOW) {
      content = <FlowTooltipContent {...object} config={config} />;
    } else {
      if ('viewport' in info && info.viewport instanceof Viewport) {
        [x, y] = info.viewport.project([object.location.lon, object.location.lat]);
      }
      radius += object.circleRadius;
      content = (
        <LocationTooltipContent
          locationInfo={object}
          isSelectionEmpty={!state.selectedLocations}
          isSelected={state.selectedLocations?.includes(String(object.id)) ?? false}
          config={config}
        />
      );
    }
    const bounds = {left: x - radius, top: y - radius, width: radius * 2, height: radius * 2};
    if (tooltip) {
      showTooltip(bounds, content);
      cancelShowTooltipDebounced();
    } else {
      showTooltipDebounced(bounds, content);
    }
  };

  if (locationsFetch.loading) {
    return <LoadingSpinner />;
  }
  if (locationsFetch.error || flowsFetch.error) {
    return (
      <Message>
        {spreadSheetKey ? (
          <>
            <p>
              Oops… Could not fetch data from{` `}
              <a href={`https://docs.google.com/spreadsheets/d/${spreadSheetKey}`}>
                this spreadsheet
              </a>
              .{` `}
            </p>
            <p>
              If you are the owner of this spreadsheet, make sure you have shared it by doing the
              following:
              <ol>
                <li>Click the “Share” button in the spreadsheet</li>
                <li>
                  Change the selection from “Restricted” to “Anyone with the link” in the drop-down
                  under “Get link”
                </li>
              </ol>
            </p>
          </>
        ) : (
          <p>Oops… Could not fetch data</p>
        )}
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
  const mapboxMapStyle = getMapboxMapStyle(state, props);

  const handleClick = (
    info: FlowmapLayerPickingInfo<Location, Flow>,
    {srcEvent}: {srcEvent: MouseEvent | {originalEvent: MouseEvent | TouchEvent}},
  ) => {
    if (info.object?.type === PickingType.LOCATION) {
      dispatch({
        type: ActionType.SELECT_LOCATION,
        locationId: String(info.object.id),
        incremental: ('originalEvent' in srcEvent ? srcEvent.originalEvent : srcEvent).shiftKey,
      });
    }
  };

  const handleChangeSelectLocations = (selectedLocations: string[] | undefined) => {
    dispatch({
      type: ActionType.SET_SELECTED_LOCATIONS,
      selectedLocations,
    });
  };

  const handleChangeLocationFilterMode = (mode: LocationFilterMode) => {
    dispatch({
      type: ActionType.SET_LOCATION_FILTER_MODE,
      mode,
    });
  };

  const handleViewStateChange = ({viewState}: {viewState: MapViewState}) => {
    cancelShowTooltipDebounced();
    dispatch({
      type: ActionType.SET_VIEWPORT,
      viewport: {...viewport, ...viewState, transitionDuration: 0},
    });
  };

  const handleTimeRangeChanged = (range: [Date, Date]) => {
    dispatch({type: ActionType.SET_TIME_RANGE, range});
  };

  const handleToggleGlobe = () => {
    cancelShowTooltipDebounced();
    dispatch({
      type: ActionType.SET_GLOBE,
      globe: !state.globe,
      selectedLocations: expandedSelection && Array.from(expandedSelection),
    });
  };

  const handleZoomIn = () => {
    dispatch({type: ActionType.ZOOM_IN});
  };

  const handleZoomOut = () => {
    dispatch({type: ActionType.ZOOM_OUT});
  };

  const handleResetBearingPitch = () => {
    dispatch({type: ActionType.RESET_BEARING_PITCH});
  };

  const handleSelectFlowsSheet: React.ChangeEventHandler<HTMLSelectElement> = (event) => {
    const sheet = event.currentTarget.value;
    const {onSetFlowsSheet} = props;
    if (onSetFlowsSheet) {
      onSetFlowsSheet(sheet);
      handleChangeSelectLocations(undefined);
    }
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

  const layers = dataProvider
    ? [
        new FlowmapLayer<Location, Flow>({
          ...flowmapAccessors,
          id: 'flow-map',
          data: layerData,
          dataProvider,
          filter: layerFilter,
          // The same cluster level drives the search box, timeline and layer.
          clusteringEnabled: state.clusteringEnabled && clusterZoom != null,
          clusteringAuto: false,
          clusteringLevel: clusterZoom,
          adaptiveScalesEnabled: state.adaptiveScalesEnabled,
          scaleLock: lockedDomains && {enabled: true, domains: lockedDomains},
          onScaleChange: embed ? undefined : handleScaleChange,
          locationTotalsEnabled: state.locationTotalsEnabled,
          darkMode,
          colorScheme,
          fadeEnabled: state.fadeEnabled,
          fadeAmount: state.fadeAmount,
          flowLinesRenderingMode,
          flowLineCurviness,
          flowLineThicknessScale: 0.75,
          wrapLongitude: !state.globe,
          // Globe routes use 96 segments each. Bound geometry on dense datasets.
          maxTopFlowsDisplayNum: state.globe ? 5000 : NUMBER_OF_FLOWS_TO_DISPLAY,
          pickable: true,
          onHover: handleHover,
          onClick: handleClick,
        }),
      ]
    : [];

  return (
    <NoScrollContainer
      ref={outerRef}
      onMouseLeave={hideTooltip}
      className={darkMode ? Classes.DARK : undefined}
    >
      <DeckGLOuter darkMode={darkMode} baseMapOpacity={state.baseMapOpacity / 100}>
        {state.globe ? (
          <GlobeMap
            viewState={viewport}
            onMove={handleViewStateChange}
            darkMode={darkMode}
            baseMapEnabled={baseMapEnabled}
            layers={layers}
          />
        ) : (
          <DeckGL
            controller={CONTROLLER_OPTIONS}
            initialViewState={viewport}
            views={FLAT_VIEW}
            onViewStateChange={handleViewStateChange}
            layers={layers}
          >
            {mapboxAccessToken && baseMapEnabled && (
              <ReactMapGl
                mapboxAccessToken={mapboxAccessToken}
                mapStyle={mapboxMapStyle}
                renderWorldCopies
                style={{width: '100%', height: '100%'}}
              />
            )}
          </DeckGL>
        )}
      </DeckGLOuter>
      {timeExtent && timeGranularity && totalCountsByTime && selectedTimeRange && (
        <Absolute bottom={20} left={100} right={200}>
          <Column spacing={10}>
            <SelectedTimeRangeBox darkMode={darkMode}>
              {selectedTimeRangeToString(selectedTimeRange, timeGranularity)}
            </SelectedTimeRangeBox>
            <TimelineBox darkMode={darkMode}>
              <Timeline
                darkMode={darkMode}
                extent={timeExtent}
                selectedRange={selectedTimeRange}
                timeGranularity={timeGranularity}
                totalCountsByTime={totalCountsByTime}
                onChange={handleTimeRangeChanged}
              />
            </TimelineBox>
          </Column>
        </Absolute>
      )}
      {layerData.flows && (
        <>
          {searchBoxLocations && (
            <Absolute top={10} right={50}>
              <BoxStyle darkMode={darkMode}>
                <LocationsSearchBox
                  locationFilterMode={state.locationFilterMode}
                  locations={searchBoxLocations}
                  selectedLocations={state.selectedLocations}
                  onSelectionChanged={handleChangeSelectLocations}
                  onLocationFilterModeChange={handleChangeLocationFilterMode}
                />
              </BoxStyle>
            </Absolute>
          )}
          <Absolute top={10} right={10}>
            <Column spacing={10}>
              <ButtonGroup vertical={true}>
                <Button title="Zoom in" icon={IconNames.PLUS} onClick={handleZoomIn} />
                <Button title="Zoom out" icon={IconNames.MINUS} onClick={handleZoomOut} />
                {!state.globe && (
                  <Button
                    title="Reset bearing and pitch"
                    icon={IconNames.COMPASS}
                    onClick={handleResetBearingPitch}
                  />
                )}
                <Button
                  title="Globe mode"
                  aria-label="Globe mode"
                  aria-pressed={state.globe}
                  icon={IconNames.GLOBE}
                  active={state.globe}
                  onClick={handleToggleGlobe}
                />
              </ButtonGroup>
              {!inBrowser && !embed && (
                <ButtonGroup vertical={true}>
                  <SharePopover
                    queryParams={stateToQueryParams(state)}
                    scaleLocked={lockedDomains != null}
                  >
                    <Button title="Share…" icon={IconNames.SHARE} />
                  </SharePopover>
                </ButtonGroup>
              )}
            </Column>
          </Absolute>
          {!embed && ((dataProvider && scaleState) || lockedDomains) && (
            <Box bottom={38} right={8} darkMode={darkMode}>
              <Collapsible darkMode={darkMode} width={148} direction={Direction.RIGHT}>
                <ScaleLegend
                  scale={dataProvider ? scaleState : undefined}
                  locked={lockedDomains != null}
                  onToggleLock={() =>
                    dispatch({
                      type: ActionType.SET_SCALE_LOCK,
                      domains: lockedDomains ? undefined : scaleState?.domains,
                    })
                  }
                />
              </Collapsible>
            </Box>
          )}
        </>
      )}
      {!embed && (
        <Absolute bottom={10} left={10}>
          <SettingsPopover
            darkMode={darkMode}
            state={state}
            dispatch={dispatch}
            clusterZoom={clusterZoom}
            availableClusterZoomLevels={getAvailableClusterZoomLevels(state, props)}
            onChangeClusteringAuto={handleChangeClusteringAuto}
          />
        </Absolute>
      )}
      {showFullscreenButton && (
        <Absolute bottom={30} right={10}>
          <Button
            title="Open in full-screen mode"
            onClick={handleFullScreen}
            icon={IconNames.FULLSCREEN}
          />
        </Absolute>
      )}
      {spreadSheetKey && !embed && (
        <TitleBox top={52} left={0} darkMode={darkMode}>
          <Collapsible darkMode={darkMode} width={300} direction={Direction.LEFT}>
            <Column spacing={10} padding="12px 20px">
              {title && (
                <div>
                  <Title>{title}</Title>
                  <Description>{description}</Description>
                </div>
              )}
              {flowsSheets && flowsSheets.length > 1 && (
                <HTMLSelect
                  value={props.flowsSheet}
                  onChange={handleSelectFlowsSheet}
                  options={flowsSheets.map((sheet) => ({
                    label: sheet,
                    value: sheet,
                  }))}
                />
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
                {config[ConfigPropName.HIDE_DATA_LINK] !== 'yes' ? (
                  <>
                    {'Data behind this map is in '}
                    <Away href={`https://docs.google.com/spreadsheets/d/${spreadSheetKey}`}>
                      this spreadsheet
                    </Away>
                    .{' '}
                    <>
                      You can{' '}
                      <Link legacyBehavior href="/">
                        publish your own map
                      </Link>{' '}
                      too.
                    </>
                  </>
                ) : null}
              </div>

              {totalFilteredCount != null && totalUnfilteredCount != null && (
                <TotalCount darkMode={darkMode}>
                  {Math.round(totalFilteredCount) === Math.round(totalUnfilteredCount)
                    ? config['msg.totalCount.allTrips']?.replace(
                        '{0}',
                        formatCount(totalUnfilteredCount),
                      )
                    : config['msg.totalCount.countOfTrips']
                        ?.replace('{0}', formatCount(totalFilteredCount))
                        .replace('{1}', formatCount(totalUnfilteredCount))}
                </TotalCount>
              )}
              <FlowmapCityLinkArea darkMode={darkMode}>
                <Popover
                  hoverOpenDelay={300}
                  interactionKind="hover"
                  position={Position.BOTTOM}
                  minimal
                  modifiers={{offset: {offset: '0, 8'}}}
                  content={
                    <FlowmapCityPopoverContent darkMode={darkMode}>
                      {`Flowmap City is the new product we are building. It offers 
                      secure data storage, more analytics capabilities,
                      improved scalability, an SQL query editor, and more coming. `}
                      <br />
                      <br />
                      <ul className="bp4-list-unstyled">
                        <li>
                          <FlowmapCityLink darkMode={darkMode}>
                            → Open this map in Flowmap City
                          </FlowmapCityLink>
                        </li>
                        <li>
                          <a href="https://flowmap.city" target="_blank" rel="noopener noreferrer">
                            → Visit www.flowmap.city to learn more
                          </a>
                        </li>
                      </ul>
                    </FlowmapCityPopoverContent>
                  }
                >
                  <Row spacing={10}>
                    <FlowmapCityLink darkMode={darkMode}>
                      <Row spacing={5} style={{display: 'inline-block'}}>
                        <Icon
                          color={Colors.BLUE5}
                          icon={IconNames.SHARE}
                          size={12}
                          style={{height: 14}}
                        />
                        <span>Open in Flowmap City</span>
                      </Row>
                    </FlowmapCityLink>

                    {/* <Column style={{position: 'relative', width: 16, height: 18}}>
                    <Absolute>
                      <TooltipBp
                        position="bottom"
                        intent={Intent.PRIMARY}
                        content={
                          <div
                            style={{fontSize: '12px', maxWidth: '200px'}}
                          >{`Flowmap City is our new product. It offers secure storage,
                    improved scalability and analytics capabilities, 
                    an SQL query editor, and more coming.`}</div>
                        }
                      >
                        <Icon
                          icon={IconNames.INFO_SIGN}
                          size={14}
                          intent={Intent.PRIMARY}
                          style={{cursor: 'pointer'}}
                        />
                      </TooltipBp>
                    </Absolute>
                  </Column> */}
                  </Row>
                </Popover>
              </FlowmapCityLinkArea>
            </Column>
          </Collapsible>
        </TitleBox>
      )}
      {tooltip && <Tooltip {...tooltip} />}
      {flowsFetch.loading && <LoadingSpinner />}
    </NoScrollContainer>
  );
};

function selectedTimeRangeToString(
  selectedTimeRange: [Date, Date],
  timeGranularity: TimeGranularity,
) {
  const {interval, formatFull, order} = timeGranularity;
  const start = selectedTimeRange[0];
  let end = selectedTimeRange[1];
  if (order >= 3) {
    end = interval.offset(end, -1);
  }
  if (end <= start) end = start;
  const startStr = formatFull(start);
  const endStr = formatFull(end);
  if (startStr === endStr) return startStr;

  // TODO: split by words, only remove common words
  // let i = 0;
  // while (i < Math.min(startStr.length, endStr.length)) {
  //   if (startStr.charAt(startStr.length - i - 1) !== endStr.charAt(endStr.length - i - 1)) {
  //     break;
  //   }
  //   i++;
  // }
  // if (i > 0) {
  //   return `${startStr.substring(0, startStr.length - i - 1)} - ${endStr}`;
  // }

  return `${startStr} – ${endStr}`;
}
export default FlowMap;
