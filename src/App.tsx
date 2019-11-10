import * as React from 'react'
import { Router, Route, Switch, RouteComponentProps } from 'react-router-dom'
import { createBrowserHistory } from 'history'
import Home from './Home'
import * as Sentry from '@sentry/browser'
import Fallback from './Fallback';
import { AppToaster } from './AppToaster';
import { Suspense } from 'react';
import LoadingSpinner from './LoadingSpinner';
import { SPREADSHEET_KEY_RE } from './constants';
import { ColorScheme } from './colors';

const GSheetsFlowMap = React.lazy(() => import('./GSheetsFlowMap'))
const InBrowserFlowMap = React.lazy(() => import('./InBrowserFlowMap'))
const ODMatrixConverter = React.lazy(() => import('./ODMatrixConverter'))
const Geocoding = React.lazy(() => import('./Geocoding'))


const history = createBrowserHistory()
history.listen(location => AppToaster.clear())

type Props = {
}

type State = {
  error: any,
}

export default class App extends React.Component<Props, State> {

  state = {
    error: null,
  }

  componentDidCatch(error: any, errorInfo: any) {
    this.setState({ error });
    if (process.env.REACT_APP_SENTRY_DSN) {
      Sentry.withScope(scope => {
        Object.keys(errorInfo).forEach(key => {
          scope.setExtra(key, errorInfo[key]);
        })
        Sentry.captureException(error);
      })
    }
  }

  render() {
    if (this.state.error) {
      // render fallback UI
      return (
        <Router history={history}>
          <Fallback>
            <>
              Oops… Sorry, but something went wrong.
              <p>
                <button
                  style={{
                    border: 'none',
                    color: ColorScheme.primary,
                    padding: 0,
                    fontSize: 15,
                    marginTop: '1em',
                    textDecoration: 'underline',
                  }}
                  onClick={Sentry.showReportDialog}>Click to report feedback
                </button>
              </p>
            </>
          </Fallback>
        </Router>
      )
    } else {
      return (
        <Router history={history}>
          <Suspense fallback={<LoadingSpinner/>}>
            <Switch>
              <Route
                path="/od-matrix-converter"
                component={ODMatrixConverter}
                />
              <Route
                path="/geocoding"
                component={Geocoding}
                />
              <Route
                path="/in-browser"
                component={InBrowserFlowMap}
                />
              <Route
                path={`/:sheetKey(${SPREADSHEET_KEY_RE})`}
                component={({ match }: RouteComponentProps<{ sheetKey: string }>) =>
                  <GSheetsFlowMap
                    spreadSheetKey={match.params.sheetKey}
                  />
                }
              />
              <Route path="/" component={Home} />
            </Switch>
          </Suspense>
        </Router>
      )
    }
  }
}

