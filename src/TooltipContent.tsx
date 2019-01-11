import * as React from 'react'
import { getFlowMagnitude, Location } from './FlowMap'
import styled from '@emotion/styled'
import * as d3Format from 'd3-format'
import { Flow } from 'flowmap.gl';

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

const formatCount = d3Format.format(',.0f')

export const LocationTooltipContent = ({ location }: { location: Location }) => {
  const { properties } = location as any;

  return (
    <Outer width={130}>
      <Title>{location.name || location.id}</Title>
      <Row>
        <Label>Incoming</Label>
        <Value>{formatCount(properties.totalIn)}</Value>
      </Row>
      <Row>
        <Label>Outgoing</Label>
        <Value>{formatCount(properties.totalOut)}</Value>
      </Row>
      <Row>
        <Label>Start and end here</Label>
        <Value>{formatCount(properties.totalWithin)}</Value>
      </Row>
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

