import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import * as React from 'react';
import * as Sentry from '@sentry/browser';
import type {AppProps} from 'next/app';
import Link from 'next/link';

import '../css/blueprint.css';
import '@blueprintjs/select/lib/css/blueprint-select.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import '../css/globals.css';
import AppToaster from '../core/AppToaster';
import {Button, FocusStyleManager, Intent} from '@blueprintjs/core';
import {IconNames} from '@blueprintjs/icons';
import styled from '@emotion/styled';
import {Router} from 'next/router';

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

try {
  if (
    globalThis.localStorage &&
    globalThis.location.pathname === '/' &&
    globalThis.localStorage.getItem('privacyPolicyAccepted') !== 'true'
  ) {
    AppToaster.show(
      {
        intent: Intent.PRIMARY,
        icon: IconNames.INFO_SIGN,
        timeout: 5000,
        message: (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              flexDirection: 'column',
            }}
          >
            <div style={{fontSize: 14}}>
              We use cookies to collect usage statistics. This helps us to improve the app. If you
              use FlowmapBlue, we assume that you agree with our very short{' '}
              <Link legacyBehavior href="/privacy">
                privacy policy
              </Link>
              .
            </div>
            <ButtonArea>
              <Button
                intent={Intent.PRIMARY}
                onClick={() => {
                  globalThis.localStorage.setItem('privacyPolicyAccepted', 'true');
                  AppToaster.dismiss('privacy');
                }}
              >
                OK, don&apos;t show it again
              </Button>
            </ButtonArea>
          </div>
        ),
      },
      'privacy',
    );
  }
} catch (err) {
  // a SecurityError will be thrown if "Block third-party cookies and site data"
  // is enabled in the browser settings
  console.error(err);
}
