import * as React from 'react'
import { BrowserRouter, Route, Switch, RouteComponentProps } from 'react-router-dom'
import Intro from './Intro'
import NoWebGlFallback from './NoWebGlFallback'
import styled from '@emotion/styled'
import MapView from './MapView';
import NoScrollContainer from './NoScrollContainer';

type Props = {
  supportsWebGl: boolean
}


export default class App extends React.Component<Props> {

  render() {
    const { supportsWebGl } = this.props
    return (
      <BrowserRouter>
        <Switch>
          <Route
            path="/:sheetKey([a-zA-Z0-9-_]{44})"
            component={({ match }: RouteComponentProps<{ sheetKey: string }>) =>
              <NoScrollContainer>{
                supportsWebGl ?
                  <MapView
                    spreadSheetKey={match.params.sheetKey}
                  />
                  :
                  <NoWebGlFallback/>
              }</NoScrollContainer>
            }
          />
          <Route path="/" component={Intro} />
        </Switch>
      </BrowserRouter>
    )
  }
}

