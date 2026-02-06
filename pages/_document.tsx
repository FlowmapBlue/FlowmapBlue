import {Head, Html, Main, NextScript} from 'next/document';
import manifest from '../public/manifest.json';
const fontUrl = 'https://fonts.googleapis.com/css?family=Sarabun:200,400,700&display=swap';

export default function Document() {
  return (
    <Html>
      <Head>
        <link href="https://flowmap.blue/" rel="canonical" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="preload" href={fontUrl} as="style" crossOrigin="anonymous" />
        <link rel="stylesheet" href={fontUrl} crossOrigin="anonymous" />
        <meta charSet="utf-8" />
        <link rel="shortcut icon" href="/favicon-32x32.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="theme-color" content="#000000" />
        <meta name="description" content={manifest.description} />
        <meta
          name="keywords"
          content="flow map, flowmap, flow mapping, visualization, mobility, urban mobility, human mobility, mobility data, origin-destination data, OD-data, geographic visualization, maps, movement, geographic movement, transport, migration, traffic, transportation, data visualization, relocation, commuters, journeys, trips, movement routes, interactive map, thematic map"
        />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#137CBD" />
        <meta name="application-name" content="FlowmapBlue" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="FlowmapBlue" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
