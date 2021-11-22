import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import * as React from 'react';
import { Global } from '@emotion/core';
import * as Sentry from '@sentry/browser';
import type { AppProps } from 'next/app';
import Link from 'next/link';
import Head from 'next/head';

import '../css/blueprint.css';
import '@blueprintjs/select/lib/css/blueprint-select.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import globalStyles from '../core/globalStyles';
import AppToaster from '../core/AppToaster';
import { Button, FocusStyleManager, Intent } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import styled from '@emotion/styled';
import { Router } from 'next/router';
import manifest from '../public/manifest.json';

FocusStyleManager.onlyShowFocusOnTabs();
AppToaster.init();
Router.events.on('beforeHistoryChange', (route: string) => {
  // Close any open popovers on route change
  AppToaster.clear();
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

function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <link href="https://flowmap.blue/" rel="canonical" />
        <link rel="manifest" href="/manifest.json" />
        <title>Flowmap.blue – Flow map visualization tool</title>
        <meta charSet="utf-8" />
        <link rel="shortcut icon" href="/favicon-32x32.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="theme-color" content="#000000" />
        <link href="https://fonts.googleapis.com/css?family=Sarabun:400,700" rel="stylesheet" />
        <meta name="description" content={manifest.description} />
        <meta
          name="keywords"
          content="flow map, flowmap, flow mapping, visualization, mobility, urban mobility, human mobility, mobility data, origin-destination data, OD-data, geographic visualization, maps, movement, geographic movement, transport, migration, traffic, transportation, data visualization, relocation, commuters, journeys, trips, movement routes, interactive map, thematic map"
        />
        <meta name="referrer" content="never" />
        <meta name="referrer" content="no-referrer" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#137CBD" />
        <meta name="application-name" content="Flowmap.blue" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Flowmap.blue" />
      </Head>
      <Global styles={globalStyles} />
      <Component {...pageProps} />
    </>
  );
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
        timeout: 0,
        message: (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              flexDirection: 'column',
            }}
          >
            <div style={{ fontSize: 14 }}>
              We use cookies to collect usage statistics. This helps us to improve the app. If you
              use Flowmap.blue, we assume that you agree with our very short{' '}
              <Link href="/privacy">privacy policy</Link>.
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
      'privacy'
    );
  }
} catch (err) {
  // a SecurityError will be thrown if "Block third-party cookies and site data"
  // is enabled in the browser settings
  console.error(err);
}
