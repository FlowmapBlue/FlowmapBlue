import * as React from 'react'
import Logo from './Logo';

export default () =>
  <div style={{
    position: 'absolute',
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  }}>
    <Logo fontSize={30}/>
    <div style={{ marginTop: 20 }}>
      Sorry, but your browser doesn't seem to support WebGL which is required for this app.
    </div>
  </div>
