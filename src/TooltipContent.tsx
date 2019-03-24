import * as React from 'react'
import { getFlowMagnitude } from './types'
import { Location } from './types'
import styled from '@emotion/styled'
import * as d3Format from 'd3-format'
import { Flow, LocationPickingInfo } from '@flowmap.gl/core';

const Outer = styled.div(({ width }: { width: number}) => `
  font-size: 10px;
  width: ${width}px;
  display: flex;
  flex-direction: column;
  & > * + * {
    margin-top: 2px;    
  }
`)

const Title = styled.div`
  font-weight: bold;
  margin-bottom: 5px;
`

const Comment = styled.div`
  font-size: 9px;
  opacity: 0.3;
  margin-top: 0.75em;  
  text-align: center;
`

const Row = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
`

const Label = styled.div`
  display: flex;
  flex-grow: 1;
  opacity: 0.7;
  margin-right: 10px;
`

const Value = styled.div`
  display: flex;
  flex-grow: 1;
  justify-content: flex-end;
`

export const formatCount = d3Format.format(',.0f')

interface Props {
  locationInfo: LocationPickingInfo
  isSelected: boolean
  isSelectionEmpty: boolean
}

export const LocationTooltipContent =
  ({ locationInfo, isSelected, isSelectionEmpty }: Props) => {

  const { object: location, totalIn, totalOut, totalWithin } = locationInfo;

  return (
    <Outer width={130}>
      <Title>{location.name || location.id}</Title>
      <Row>
        <Label>Incoming trips</Label>
        <Value>{formatCount(totalIn)}</Value>
      </Row>
      <Row>
        <Label>Outgoing trips</Label>
        <Value>{formatCount(totalOut)}</Value>
      </Row>
      <Row>
        <Label>Start and end here</Label>
        <Value>{formatCount(totalWithin)}</Value>
      </Row>
      <Comment>
        {isSelected ?
        `Click to remove from selection` :
        isSelectionEmpty ?
        `Click to select this location`
        : `Shift+click to add to selection`
        }
      </Comment>
    </Outer>
  )
}

export const FlowTooltipContent = ({ flow, origin, dest }: { flow: Flow, origin: Location, dest: Location }) => {
  return (
    <Outer width={150}>
      <Title>{origin.name || origin.id} → {dest.name || dest.id}</Title>
      <Row>
        <Label>Number of trips</Label>
        <Value>{formatCount(getFlowMagnitude(flow))}</Value>
      </Row>
    </Outer>
  )
}

