import React, { ReactNode } from 'react';
import checkWebglSupport from './checkWebglSupport';
import NoScrollContainer from './NoScrollContainer';
import { Absolute } from './Boxes';
import Logo from './Logo';
import { ColorScheme, Fallback } from './index';
import styled from '@emotion/styled';

interface Props {
  embed?: boolean;
  children: ReactNode;
}

const supportsWebGl = checkWebglSupport();

const LogoOuter = styled(Absolute)`
  filter: grayscale(1);
  svg {
    circle {
      fill: #fff;
      stroke: ${ColorScheme.primary};
      stroke-width: 10px;
    }
    path {
      fill: #000;
      stroke-width: 10px;
      stroke: ${ColorScheme.primary};
    }
  }
`;

const MapContainer: React.FC<Props> = ({ embed, children }) => (
  <NoScrollContainer>
    {supportsWebGl ? (
      <>
        {children}
        <LogoOuter top={10} left={10}>
          <Logo embed={embed} fontSize={20} />
        </LogoOuter>
      </>
    ) : (
      <Fallback>
        Sorry, but your browser doesn't seem to support WebGL which is required for this app.
      </Fallback>
    )}
  </NoScrollContainer>
);

export default MapContainer;
