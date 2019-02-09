import { Colors } from '@blueprintjs/core'
import * as React from 'react'
import styled from '@emotion/styled'
import { FlowDirection } from './types'

export interface Props {
  width: number
  height: number
  dir: FlowDirection
  color?: string
}

const Svg = styled.svg({
  display: 'block',
  alignSelf: 'center',
  justifySelf: 'center',
})

const FlowDirectionIcon: React.FC<Props> = ({ width, height, dir, color = Colors.GRAY4 }) => (
  <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 2 13 8" width={width} height={height}>
    <g stroke="none" fill="none" fillRule="evenodd">
      <g transform="translate(-132.000000, -15.000000)" fillRule="nonzero" fill={color}>
        <g transform="translate(129.000000, 12.000000)">
          {dir === FlowDirection.BOTH && (
            <g transform="translate(9.500000, 9.000000) scale(-1, 1) rotate(-90.000000) translate(-9.500000, -9.000000) translate(4.000000, 3.000000)">
              <polygon points="3.69093594 10.4923443 3.69093594 2.09132717 1.31871876 4.87896986 0 4.36774333 3.71706043 0 5 0.512416815 5 11" />
              <polygon points="6 11.4875832 6 1 7.30906406 1.50765568 7.30906406 9.90867283 9.68184916 7.12043499 11 7.63166153 7.28293957 12" />
            </g>
          )}
          {dir === FlowDirection.IN && (
            <g transform="translate(9.500000, 8.000000) scale(-1, 1) rotate(-90.000000) translate(-9.500000, -8.000000) translate(5.500000, 2.500000)">
              <path
                d="M3,2.42495025 L1.16226061,4.87145219 L0,4.36101337 L3.27605326,0 L3.70338983,0.19335981 L4.1307264,0 L7.40677966,4.36101337
                               L6.24451906,4.87145219 L4.40677966,2.42495025 L4.40677966,10.9830508 L3.70338983,10.6740331 L3,10.9830508 L3,2.42495025 Z"
              />
            </g>
          )}
          {dir === FlowDirection.OUT && (
            <g transform="translate(8.500000, 9.000000) scale(-1, 1) rotate(90.000000) translate(-9.500000, -8.000000) translate(5.500000, 3.500000)">
              <path
                d="M3,2.42495025 L1.16226061,4.87145219 L0,4.36101337 L3.27605326,0 L3.70338983,0.19335981 L4.1307264,0 L7.40677966,4.36101337
                               L6.24451906,4.87145219 L4.40677966,2.42495025 L4.40677966,10.9830508 L3.70338983,10.6740331 L3,10.9830508 L3,2.42495025 Z"
              />
            </g>
          )}
        </g>
      </g>
    </g>
  </Svg>
)

export default FlowDirectionIcon
