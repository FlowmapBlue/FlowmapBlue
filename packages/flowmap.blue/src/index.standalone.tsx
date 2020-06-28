import React from 'react';
import * as ReactDOM from 'react-dom';
import { DEFAULT_CONFIG } from './config';
import FlowMap from './FlowMap';
import { PromiseState } from 'react-refetch';
import { Flow, Location } from './types';
import MapContainer from './MapContainer';
import { ColorScheme, Fallback } from './index';
import { Router } from 'react-router-dom';
import { createBrowserHistory } from 'history';

import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/select/lib/css/blueprint-select.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import { css, Global } from '@emotion/core';
import { Classes, Colors, FocusStyleManager } from '@blueprintjs/core';

FocusStyleManager.onlyShowFocusOnTabs();

const history = createBrowserHistory();

const globalStyles = css`
  html,
  body,
  button,
  select {
    margin: 0;
    background-color: ${'#2d3a4c'};
    font-size: 13pt;
  }
               
  body, * {
    font-family: 'Sarabun', sans-serif;
  }
             
  a,
  a:visited {
    color: ${ColorScheme.primary};
  }
  .${Classes.DARK} {
    a,
    a:visited {
      color: ${Colors.BLUE5};
    }
  }

  .mapboxgl-control-container {
    a,
    a:visited {
      color: ${Colors.DARK_GRAY1};
    }
  }

  section {
    margin-bottom: 4em;
  }
  #no-token-warning {
    bottom: 30px;
    top: unset !important;
    left: 10px !important;
  }
`;

class ErrorBoundary extends React.Component<{}, {}> {
  state = {hasError: false, error: null};

  static getDerivedStateFromError(error: any) {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(error);
  }

  render() {
    if (this.state.hasError) {
      const { error } = this.state;
      return (
      <Fallback>
        <>
          Oops… Sorry, but something went wrong.
          {error && (
            <div
              style={{
                margin: '10px 0',
              }}
            >
              {JSON.stringify(error)}
            </div>
          )}
        </>
      </Fallback>
      );
    }
    return this.props.children;
  }
}

export default function(
  locations: Location[],
  flows: Flow[],
  container: HTMLElement
) {
  ReactDOM.render(
    <Router history={history}>
      <ErrorBoundary>
        <Global styles={globalStyles} />
        <MapContainer>
          <FlowMap
            inBrowser={true}
            flowsFetch={PromiseState.resolve(flows)}
            locationsFetch={PromiseState.resolve(locations)}
            config={DEFAULT_CONFIG}
            spreadSheetKey={undefined}
            flowsSheet={undefined}
          />
        </MapContainer>
      </ErrorBoundary>
    </Router>,
    container
  );
}
