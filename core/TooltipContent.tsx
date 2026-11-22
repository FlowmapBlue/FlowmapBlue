import * as React from 'react';
import {Config, Flow, Location} from './types';
import styled from '@emotion/styled';
import * as d3Format from 'd3-format';
import {FlowPickingInfoObject, LocationPickingInfoObject} from '@flowmap.gl/layers';

type OuterProps = {width: number};
const Outer = styled.div<OuterProps>(
  ({width}: OuterProps) => `
  font-size: 10px;
  width: ${width}px;
  display: flex;
  flex-direction: column;
  & > * + * {
    margin-top: 2px;    
  }
`,
);

const Title = styled.div`
  font-weight: bold;
  margin-bottom: 5px;
`;

const Comment = styled.div`
  font-size: 9px;
  opacity: 0.3;
  margin-top: 0.75em;
  text-align: center;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
`;

const Label = styled.div`
  display: flex;
  flex-grow: 1;
  opacity: 0.7;
  margin-right: 10px;
`;

const Value = styled.div`
  display: flex;
  flex-grow: 1;
  justify-content: flex-end;
`;

export const formatCount = d3Format.format(',.0f');

interface Props {
  locationInfo: LocationPickingInfoObject<Location>;
  isSelected: boolean;
  isSelectionEmpty: boolean;
  config: Config;
}

export const LocationTooltipContent = ({
  locationInfo,
  isSelected,
  isSelectionEmpty,
  config,
}: Props) => {
  const {
    name,
    totals: {incomingCount, outgoingCount, internalCount},
  } = locationInfo;

  return (
    <Outer width={150}>
      <Title>{name}</Title>
      <Row>
        <Label>{config['msg.locationTooltip.incoming']}</Label>
        <Value>{formatCount(incomingCount)}</Value>
      </Row>
      <Row>
        <Label>{config['msg.locationTooltip.outgoing']}</Label>
        <Value>{formatCount(outgoingCount)}</Value>
      </Row>
      <Row>
        <Label>{config['msg.locationTooltip.internal']}</Label>
        <Value>{formatCount(internalCount)}</Value>
      </Row>
      <Comment>
        {isSelected
          ? `Click to remove from selection`
          : isSelectionEmpty
          ? `Click to select this location`
          : `Shift+click to add to selection`}
      </Comment>
    </Outer>
  );
};

export const FlowTooltipContent = ({
  count,
  origin,
  dest,
  config,
}: Pick<FlowPickingInfoObject<Location, Flow>, 'count' | 'origin' | 'dest'> & {config: Config}) => {
  return (
    <Outer width={150}>
      <Title>
        {('name' in origin && origin.name) || origin.id} →{' '}
        {('name' in dest && dest.name) || dest.id}
      </Title>
      <Row>
        <Label>{config['msg.flowTooltip.numOfTrips']}</Label>
        <Value>{formatCount(count)}</Value>
      </Row>
    </Outer>
  );
};
