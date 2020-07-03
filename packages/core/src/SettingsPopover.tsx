import { Column, LegendTitle, Row } from './Boxes';
import { Button, Popover, Slider, Switch } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';
import { Dispatch, SyntheticEvent } from 'react';
import styled from '@emotion/styled';
import { Action, ActionType, State } from './FlowMap.state';
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

interface Props {
  state: State;
  darkMode: boolean;
  dispatch: Dispatch<Action>;
}

const SettingsPopover: React.FC<Props> = ({ dispatch, state, darkMode }) => {
  const handleToggleClustering = (evt: SyntheticEvent) => {
    const value = (evt.target as HTMLInputElement).checked;
    dispatch({
      type: ActionType.SET_CLUSTERING_ENABLED,
      clusteringEnabled: value,
    });
  };

  const handleToggleDarkMode = (evt: SyntheticEvent) => {
    const value = (evt.target as HTMLInputElement).checked;
    dispatch({
      type: ActionType.SET_DARK_MODE,
      darkMode: value,
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

  const handleToggleAnimation = (evt: SyntheticEvent) => {
    const value = (evt.target as HTMLInputElement).checked;
    dispatch({
      type: ActionType.SET_ANIMATION_ENABLED,
      animationEnabled: value,
    });
  };

  const handleToggleLocationTotals = (evt: SyntheticEvent) => {
    const value = (evt.target as HTMLInputElement).checked;
    dispatch({
      type: ActionType.SET_LOCATION_TOTALS_ENABLED,
      locationTotalsEnabled: value,
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
              <div style={{ whiteSpace: 'nowrap' }}>Color scheme</div>
              <ColorSchemeSelector
                selected={state.colorSchemeKey}
                reverse={darkMode}
                onChange={handleChangeColorScheme}
              />
            </Row>
            <Row spacing={15}>
              <div>Fade</div>
              <Slider
                value={state.fadeAmount}
                min={0}
                max={100}
                stepSize={1}
                labelRenderer={false}
                showTrackFill={false}
                onChange={handleChangeFadeAmount}
              />
            </Row>
            <Column spacing={10}>
              <StyledSwitch
                checked={state.darkMode}
                label="Dark mode"
                onChange={handleToggleDarkMode}
              />
              <StyledSwitch
                checked={state.animationEnabled}
                label="Animate flows"
                onChange={handleToggleAnimation}
              />
              <StyledSwitch
                checked={state.clusteringEnabled}
                label="Cluster on zoom"
                onChange={handleToggleClustering}
              />
              <StyledSwitch
                checked={state.locationTotalsEnabled}
                label="Location totals"
                onChange={handleToggleLocationTotals}
              />
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
