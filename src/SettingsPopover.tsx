import { Column, LegendTitle, Row } from './Boxes';
import { HTMLSelect, Popover, Slider, Switch } from '@blueprintjs/core';
import { COLOR_SCHEMES } from './colors';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';
import styled from '@emotion/styled';
import { SyntheticEvent } from 'react';
import { Action, ActionType, State } from './FlowMap.state';
import { Dispatch } from 'react';
import { NoOutlineButton } from './FlowMap';

const SettingsOuter = styled.div`
  font-size: 12px;
`;

const StyledSwitch = styled(Switch)`
  margin-bottom: 0;
  align-self: flex-start;
`;

interface Props {
  state: State;
  dispatch: Dispatch<Action>;
}

const SettingsPopover: React.FC<Props> = ({ dispatch, state }) => {
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

  const handleChangeFadeAmount = (value: number) => {
    dispatch({
      type: ActionType.SET_FADE_AMOUNT,
      fadeAmount: value,
    });
  };

  const handleChangeColorScheme = (evt: SyntheticEvent) => {
    const value = (evt.target as HTMLInputElement).value;
    dispatch({
      type: ActionType.SET_COLOR_SCHEME,
      colorSchemeKey: value,
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
      hoverOpenDelay={0}
      hoverCloseDelay={0}
      content={
        <SettingsOuter>
          <Column spacing={10} padding="12px 20px">
            <LegendTitle>Settings</LegendTitle>
            <Row spacing={5}>
              <div>Color scheme</div>
              <HTMLSelect
                style={{ fontSize: 12 }}
                value={state.colorSchemeKey}
                onChange={handleChangeColorScheme}
              >
                <option>Default</option>
                {Object.keys(COLOR_SCHEMES)
                  .sort()
                  .map(scheme => (
                    <option key={scheme}>{scheme}</option>
                  ))}
              </HTMLSelect>
            </Row>
            <Row spacing={15}>
              <div style={{ whiteSpace: 'nowrap' }}>Fade</div>
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
            <Row spacing={20}>
              <StyledSwitch
                checked={state.darkMode}
                label="Dark mode"
                onChange={handleToggleDarkMode}
              />
            </Row>
            <Row spacing={10}>
              <StyledSwitch
                checked={state.clusteringEnabled}
                label="Cluster on zoom"
                onChange={handleToggleClustering}
              />
            </Row>
            <Row spacing={20}>
              <StyledSwitch
                checked={state.locationTotalsEnabled}
                label="Location totals"
                onChange={handleToggleLocationTotals}
              />
            </Row>
            <Row spacing={20}>
              <StyledSwitch
                checked={state.animationEnabled}
                label="Animate flows"
                onChange={handleToggleAnimation}
              />
            </Row>
          </Column>
        </SettingsOuter>
      }
    >
      <NoOutlineButton title="Settings…" icon={IconNames.COG} />
    </Popover>
  );
};

export default SettingsPopover;
