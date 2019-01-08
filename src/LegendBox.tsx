import * as React from 'react';

export interface LegendBoxProps {
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  children: React.ReactNode;
}

const styles = {
  outer: {
    position: 'absolute' as 'absolute',
    background: 'rgba(255, 255, 255, 0.6)',
    padding: 10,
    borderRadius: 4,
    fontFamily: 'sans-serif',
    fontSize: 11,
  },
};

const LegendBox: React.SFC<LegendBoxProps> = ({ top, left, right, bottom, children }) => (
  <div
    style={{
      ...styles.outer,
      top,
      left,
      right,
      bottom,
    }}
  >
    {children}
  </div>
);

export default LegendBox;
