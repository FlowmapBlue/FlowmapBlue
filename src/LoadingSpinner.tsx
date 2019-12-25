import * as React from 'react';
import styled from '@emotion/styled';
import spinnerSvg from './loading-spinner.svg';

const Outer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  height: 100%;
  width: 100%;
`;

const Spinner = styled.img`
  margin: auto auto;
  width: 40px;
  height: 40px;
`;

const Loader = () => (
  <Outer>
    <Spinner src={spinnerSvg} alt="Loading…" />
  </Outer>
);

export default Loader;
