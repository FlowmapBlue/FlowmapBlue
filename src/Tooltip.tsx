import * as React from 'react';
import { Popper } from 'react-popper';
import { Placement } from 'popper.js';
import styled from '@emotion/styled';

export type TargetBounds = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export interface Props {
  target: TargetBounds;
  placement?: Placement;
  content: React.ReactNode;
}

class VirtualReference {
  target: TargetBounds;
  constructor(target: TargetBounds) {
    this.target = target;
  }
  getBoundingClientRect() {
    const { left, top, width, height } = this.target;
    return {
      top,
      left,
      bottom: top + height,
      right: left + width,
      width,
      height,
    };
  }
  get clientWidth() {
    return this.target.width;
  }
  get clientHeight() {
    return this.target.height;
  }
}

const ContentWrapper = styled.div`
  pointer-events: none;
  background: #224455;
  color: #fff;
  border-radius: 5px;
  padding: 7px;
`;

const Tooltip = ({ target, content, placement }: Props) => (
  <Popper placement={placement} referenceElement={new VirtualReference(target)}>
    {({ ref, style, placement, arrowProps }) => (
      <ContentWrapper ref={ref} style={style} data-placement={placement}>
        {content}
        <div ref={arrowProps.ref} style={arrowProps.style} />
      </ContentWrapper>
    )}
  </Popper>
);

export default Tooltip;
