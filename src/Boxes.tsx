import * as React from 'react'
import styled from '@emotion/styled'

export interface AbsoluteProps {
  top?: number
  left?: number
  right?: number
  bottom?: number
}

export const Column = styled.div(({ spacing = 0 }: { spacing?: number }) => `
  display: flex;
  flex-direction: column;
  & > * + * { margin-top: ${spacing}px; }
`)

export const Row = styled.div(({ spacing = 0 }: { spacing?: number }) => `
  display: flex;
  flex-direction: row;
  align-items: center;
  & > * + * { margin-left: ${spacing}px; }
`)

export const Absolute = styled.div<AbsoluteProps>(({ top, left, right, bottom }: AbsoluteProps) => `
  position: absolute;
  ${top != null ? `top: ${top}px;` : ''}
  ${left != null ? `left: ${left}px;` : ''}
  ${right != null ? `right: ${right}px;` : ''}
  ${bottom != null ? `bottom: ${bottom}px;` : ''}
`)

export const Box = styled(Absolute)`
  background: rgba(255, 255, 255, 0.9);
  padding: 12px;
  border-radius: 4px;
  font-size: 11px;
  box-shadow: 2px 2px 4px #ccc; 
`

export const LegendBox = styled(Box)`
  text-align: center;
`

export const TitleBox = styled(Box)`
  max-width: 260px;
  padding: 15px 15px 15px 20px;
  line-height: 1.3;
  font-size: 13px;
`

export const Title = styled.div`
  font-weight: bold;
  font-size: 18px;
  margin-bottom: 10px;
`

export const LegendTitle = styled.div`
  font-weight: bold;
  font-size: 12px;
  margin-bottom: 7px;
`

export const WarningTitle = styled(LegendTitle)`
  text-align: left;
`

export const WarningBox = styled(LegendBox)`
  background: rgba(255, 210, 200, 0.9);
  max-width: 200px;
`
