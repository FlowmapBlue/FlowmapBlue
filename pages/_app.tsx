import * as Sentry from '@sentry/browser';
import type {AppProps} from 'next/app';
import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';

import {FocusStyleManager} from '@blueprintjs/core';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';
import '@blueprintjs/select/lib/css/blueprint-select.css';
import styled from '@emotion/styled';
import 'mapbox-gl/dist/mapbox-gl.css';
import {Router} from 'next/router';
import AppToaster from '../core/AppToaster';
import '../css/blueprint.css';
import '../css/globals.css';

FocusStyleManager.onlyShowFocusOnTabs();
AppToaster.init();
Router.events.on('beforeHistoryChange', (route: string) => {
  if (!route.startsWith(globalThis.location.pathname)) {
    // Close any open popovers on route change
    AppToaster.clear();
  }
});

const ButtonArea = styled.div({
  marginTop: 10,
  '@media (min-width: 520px)': {
    marginTop: -10,
    left: 20,
    '& > button': {
      position: 'relative',
      left: 20,
    },
  },
});

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  });
}

function App({Component, pageProps}: AppProps) {
  return <Component {...pageProps} />;
}

export default App;
