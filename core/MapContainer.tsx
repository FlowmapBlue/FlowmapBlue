import React, {ReactNode} from 'react';
import checkWebglSupport from './checkWebglSupport';
import NoScrollContainer from './NoScrollContainer';
import {Absolute} from './Boxes';
import Logo from './Logo';
import {ColorScheme} from './colors';
import {Away, Fallback} from './index';
import styled from '@emotion/styled';
import Image from 'next/image';

interface Props {
  embed?: boolean;
  children: ReactNode;
}

const supportsWebGl = checkWebglSupport();

const LogoOuter = styled.div`
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

const MapContainer: React.FC<Props> = ({embed, children}) => (
  <NoScrollContainer>
    {supportsWebGl ? (
      <>
        {children}
        <Absolute top={10} left={10}>
          <div style={{display: 'flex', alignItems: 'flex-end', gap: 10}}>
            <LogoOuter>
              <Logo embed={embed} fontSize={20} />
            </LogoOuter>
            <Away href="https://supportukrainenow.org/">
              <Image
                alt={'Support Ukraine'}
                title={'Support Ukraine'}
                width={30 * 0.8}
                height={20 * 0.8}
                src={'/images/StandWithUkraine.svg'}
              />
            </Away>
          </div>
        </Absolute>
      </>
    ) : (
      <Fallback>
        Sorry, but your browser does not seem to support WebGL which is required for this app.
      </Fallback>
    )}
  </NoScrollContainer>
);

export default MapContainer;
