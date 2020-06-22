import React, { ReactNode } from 'react';
import Fallback from './Fallback';
import checkWebglSupport from './checkWebglSupport';
import { Absolute, Logo, NoScrollContainer } from 'flowmap.blue';

interface Props {
  embed?: boolean;
  children: ReactNode;
}

const supportsWebGl = checkWebglSupport();

const MapContainer: React.FC<Props> = ({ embed, children }) => (
  <NoScrollContainer>
    {supportsWebGl ? (
      <>
        {children}
        <Absolute top={10} left={10}>
          <Logo embed={embed} />
        </Absolute>
      </>
    ) : (
      <Fallback>
        Sorry, but your browser doesn't seem to support WebGL which is required for this app.
      </Fallback>
    )}
  </NoScrollContainer>
);

export default MapContainer;
