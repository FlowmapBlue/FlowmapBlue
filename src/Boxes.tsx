import * as React from 'react'
import styled from '@emotion/styled'

export interface AbsoluteProps {
  top?: number
  left?: number
  right?: number
  bottom?: number
}

export const Column = styled.div(({ spacing = 0, padding = 0 }: { spacing?: number, padding?: number }) => `
  display: flex;
  flex-direction: column;
  padding: ${padding}px;
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
  // padding: 12px;
  border-radius: 4px;
  font-size: 11px;
  box-shadow: 0 0 4px #aaa; 
`

export const TitleBox = styled(Box)`
  line-height: 1.3;
  font-size: 13px;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
`

export const Title = styled.div`
  font-weight: bold;
  font-size: 18px;
  margin-bottom: 10px;
`

export const Description = styled.div`
  max-height: 155px;
  overflow: auto;
`

export const LegendTitle = styled.div`
  font-weight: bold;
  font-size: 13px;
`

export const ToastContent = styled.div`
  font-size: 12px;
`
