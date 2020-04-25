import * as React from 'react';
import Logo from './Logo';
import { Classes } from '@blueprintjs/core';

export default ({ children }: { children: React.ReactChild }) => (
  <div
    className={Classes.DARK}
    style={{
      position: 'absolute',
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
    }}
  >
    <Logo fontSize={30} />
    <div
      style={{
        margin: '20px auto 0 auto',
        maxWidth: '70%',
      }}
    >
      {children}
    </div>
  </div>
);
