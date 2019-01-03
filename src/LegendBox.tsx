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
    background: '#fff',
    padding: 10,
    borderRadius: 4,
    border: '1px solid #ccc',
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
