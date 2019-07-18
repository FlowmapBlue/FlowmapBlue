import * as React from 'react'
import { Router, Route, Switch, RouteComponentProps } from 'react-router-dom'
import createBrowserHistory from 'history/createBrowserHistory'
import Intro from './Intro'
import * as Sentry from '@sentry/browser'
import NoScrollContainer from './NoScrollContainer';
import Fallback from './Fallback';
import { AppToaster } from './AppToaster';
import { Suspense } from 'react';
import LoadingSpinner from './LoadingSpinner';
import { SPREADSHEET_KEY_RE } from './constants';
import { ColorScheme } from './colors';

const MapView = React.lazy(() => import('./MapView'))


const history = createBrowserHistory()
history.listen(location => AppToaster.clear())

type Props = {
  supportsWebGl: boolean,
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
      const { supportsWebGl } = this.props
      return (
        <Router history={history}>
          <Suspense fallback={<LoadingSpinner/>}>
            <Switch>
              <Route
                path={`/:sheetKey(${SPREADSHEET_KEY_RE})`}
                component={({ match }: RouteComponentProps<{ sheetKey: string }>) =>
                  <NoScrollContainer>{
                    supportsWebGl ?
                      <MapView
                        spreadSheetKey={match.params.sheetKey}
                      />
                      :
                      <Fallback>
                        Sorry, but your browser doesn't seem to support WebGL which is required for this app.
                      </Fallback>
                  }</NoScrollContainer>
                }
              />
              <Route path="/" component={Intro} />
            </Switch>
          </Suspense>
        </Router>
      )
    }
  }
}

