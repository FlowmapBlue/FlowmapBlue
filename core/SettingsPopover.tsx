import {Column, LegendTitle, Row} from './Boxes';
import {Button, ButtonGroup, Popover, Slider, Switch} from '@blueprintjs/core';
import {IconNames} from '@blueprintjs/icons';
import * as React from 'react';
import {Dispatch, SyntheticEvent} from 'react';
import styled from '@emotion/styled';
import {Action, ActionType, MAX_FLOW_LINE_CURVINESS, State} from './FlowMap.state';
import ColorSchemeSelector from './ColorSchemeSelector';

const SettingsOuter = styled.div`
  width: 290px;
  font-size: 12px;
`;

const StyledSwitch = styled(Switch)`
  margin-bottom: 0;
  align-self: flex-start;
  white-space: nowrap;
`;

const flowLineOptions = [
  {mode: 'straight', label: 'Straight'},
  {mode: 'curved', label: 'Curved'},
  {mode: 'animated-straight', label: 'Animated'},
] as const;

interface Props {
  state: State;
  darkMode: boolean;
  dispatch: Dispatch<Action>;
  clusterZoom: number | undefined;
  availableClusterZoomLevels: number[] | undefined;
  onChangeClusteringAuto: (value: boolean) => void;
}

const SettingsPopover: React.FC<Props> = ({
  dispatch,
  state,
  darkMode,
  clusterZoom,
  availableClusterZoomLevels,
  onChangeClusteringAuto,
}) => {
  const handleToggleClustering = (evt: SyntheticEvent) => {
    const value = (evt.target as HTMLInputElement).checked;
    dispatch({
      type: ActionType.SET_CLUSTERING_ENABLED,
      clusteringEnabled: value,
    });
  };

  const handleToggleClusteringAuto = (evt: SyntheticEvent) => {
    const value = (evt.target as HTMLInputElement).checked;
    onChangeClusteringAuto(value);
  };

  const handleChangeManualClusterZoom = (index: number) => {
    dispatch({
      type: ActionType.SET_MANUAL_CLUSTER_ZOOM,
      manualClusterZoom: availableClusterZoomLevels
        ? availableClusterZoomLevels[availableClusterZoomLevels.length - 1 - index]
        : undefined,
    });
  };

  const handleToggleDarkMode = (evt: SyntheticEvent) => {
    const value = (evt.target as HTMLInputElement).checked;
    dispatch({
      type: ActionType.SET_DARK_MODE,
      darkMode: value,
    });
  };

  const handleToggleFadeEnabled = (evt: SyntheticEvent) => {
    const value = (evt.target as HTMLInputElement).checked;
    dispatch({
      type: ActionType.SET_FADE_ENABLED,
      fadeEnabled: value,
    });
  };

  const handleToggleBaseMap = (evt: SyntheticEvent) => {
    const value = (evt.target as HTMLInputElement).checked;
    dispatch({
      type: ActionType.SET_BASE_MAP_ENABLED,
      baseMapEnabled: value,
    });
  };

  const handleChangeFadeAmount = (value: number) => {
    dispatch({
      type: ActionType.SET_FADE_AMOUNT,
      fadeAmount: value,
    });
  };

  const handleChangeBaseMapOpacity = (value: number) => {
    dispatch({
      type: ActionType.SET_BASE_MAP_OPACITY,
      baseMapOpacity: value,
    });
  };

  const handleChangeColorScheme = (colorSchemeKey: string) => {
    dispatch({
      type: ActionType.SET_COLOR_SCHEME,
      colorSchemeKey,
    });
  };

  const handleToggleLocationTotals = (evt: SyntheticEvent) => {
    const value = (evt.target as HTMLInputElement).checked;
    dispatch({
      type: ActionType.SET_LOCATION_TOTALS_ENABLED,
      locationTotalsEnabled: value,
    });
  };

  const handleToggleAdaptiveScales = (evt: SyntheticEvent) => {
    const value = (evt.target as HTMLInputElement).checked;
    dispatch({
      type: ActionType.SET_ADAPTIVE_SCALES_ENABLED,
      adaptiveScalesEnabled: value,
    });
  };

  return (
    <Popover
      usePortal={false}
      hoverOpenDelay={0}
      hoverCloseDelay={0}
      content={
        <SettingsOuter>
          <Column spacing={10} padding="12px 20px">
            <LegendTitle>Settings</LegendTitle>
            <Row spacing={5}>
              <div style={{whiteSpace: 'nowrap'}}>Color scheme</div>
              <ColorSchemeSelector
                selected={state.colorSchemeKey}
                reverse={darkMode}
                onChange={handleChangeColorScheme}
              />
            </Row>
            <Column spacing={10}>
              <StyledSwitch
                checked={state.darkMode}
                label="Dark mode"
                onChange={handleToggleDarkMode}
              />
              <Row spacing={15}>
                <StyledSwitch
                  checked={state.fadeEnabled}
                  label="Fade"
                  onChange={handleToggleFadeEnabled}
                />
                {state.fadeEnabled && (
                  <Slider
                    value={state.fadeAmount}
                    min={0}
                    max={100}
                    stepSize={1}
                    labelRenderer={false}
                    showTrackFill={false}
                    onChange={handleChangeFadeAmount}
                  />
                )}
              </Row>
              <Row spacing={15}>
                <StyledSwitch
                  checked={state.baseMapEnabled}
                  label="Base map"
                  onChange={handleToggleBaseMap}
                />
                {state.baseMapEnabled && (
                  <Slider
                    value={state.baseMapOpacity}
                    min={0}
                    max={100}
                    stepSize={1}
                    labelRenderer={false}
                    showTrackFill={false}
                    onChange={handleChangeBaseMapOpacity}
                  />
                )}
              </Row>
              <Column spacing={5}>
                <div>Flow lines</div>
                <ButtonGroup fill role="group" aria-label="Flow lines">
                  {flowLineOptions.map(({mode, label}) => (
                    <Button
                      key={mode}
                      small
                      text={label}
                      active={state.flowLinesRenderingMode === mode}
                      aria-pressed={state.flowLinesRenderingMode === mode}
                      onClick={() =>
                        dispatch({type: ActionType.SET_FLOW_LINES_RENDERING_MODE, mode})
                      }
                    />
                  ))}
                </ButtonGroup>
              </Column>
              {state.flowLinesRenderingMode === 'curved' && (
                <Row spacing={15}>
                  <div>Curviness</div>
                  <Slider
                    value={state.flowLineCurviness}
                    min={0}
                    max={MAX_FLOW_LINE_CURVINESS}
                    stepSize={0.1}
                    labelRenderer={false}
                    showTrackFill={false}
                    handleHtmlProps={{'aria-label': 'Curviness'}}
                    onChange={(curviness) =>
                      dispatch({type: ActionType.SET_FLOW_LINE_CURVINESS, curviness})
                    }
                  />
                </Row>
              )}
              <StyledSwitch
                checked={state.adaptiveScalesEnabled}
                label="Dynamic range adjustment"
                onChange={handleToggleAdaptiveScales}
              />
              <StyledSwitch
                checked={state.locationTotalsEnabled}
                label="Location totals"
                onChange={handleToggleLocationTotals}
              />
              {availableClusterZoomLevels && availableClusterZoomLevels.length > 0 && (
                <>
                  <Row spacing={15}>
                    <StyledSwitch
                      checked={state.clusteringEnabled}
                      label="Clustering"
                      onChange={handleToggleClustering}
                    />
                    {state.clusteringEnabled && (
                      <StyledSwitch
                        checked={state.clusteringAuto}
                        innerLabel={state.clusteringAuto ? 'Auto' : 'Manual'}
                        onChange={handleToggleClusteringAuto}
                      />
                    )}
                  </Row>
                  {state.clusteringEnabled && !state.clusteringAuto && (
                    <Row spacing={15}>
                      <div style={{whiteSpace: 'nowrap', marginLeft: 38}}>Level</div>
                      <Slider
                        value={
                          availableClusterZoomLevels.length -
                          1 -
                          availableClusterZoomLevels.indexOf(
                            clusterZoom ?? availableClusterZoomLevels[0],
                          )
                        }
                        min={0}
                        max={availableClusterZoomLevels.length - 1}
                        stepSize={1}
                        labelRenderer={false}
                        showTrackFill={false}
                        onChange={handleChangeManualClusterZoom}
                      />
                    </Row>
                  )}
                </>
              )}
            </Column>
          </Column>
        </SettingsOuter>
      }
    >
      <Button title="Settings…" icon={IconNames.COG} />
    </Popover>
  );
};

export default SettingsPopover;
