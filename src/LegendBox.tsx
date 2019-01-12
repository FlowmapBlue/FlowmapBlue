import * as React from 'react'
import styled from '@emotion/styled'

export interface LegendBoxProps {
  top?: number
  left?: number
  right?: number
  bottom?: number
  children: React.ReactNode
}

const LegendBox = styled.div<LegendBoxProps>(({ top, left, right, bottom }: LegendBoxProps) => ({
  position: 'absolute' as 'absolute',
  background: 'rgba(255, 255, 255, 0.9)',
  padding: 10,
  borderRadius: 4,
  fontFamily: 'sans-serif',
  fontSize: 11,
  top,
  left,
  right,
  bottom,
}))

export const LegendTitle = styled.div`
  text-align: center;
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

export default LegendBox
