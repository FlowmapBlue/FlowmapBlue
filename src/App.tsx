import * as React from 'react'
import { BrowserRouter, Route, Switch, RouteComponentProps } from 'react-router-dom'
import FlowMap from './FlowMap'
import Intro from './Intro'
import NoWebGlFallback from './NoWebGlFallback'
import styled from '@emotion/styled'

type Props = {
  supportsWebGl: boolean
}

const NoScroll = styled.div`
  position: absolute;
  top: 0; left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
`

export default class App extends React.Component<Props> {

  render() {
    const { supportsWebGl } = this.props
    return (
      <BrowserRouter>
        <Switch>
          <Route
            path="/:sheetKey([a-zA-Z0-9-_]{44})"
            component={({ match }: RouteComponentProps<{ sheetKey: string }>) =>
              <NoScroll>{
                supportsWebGl ?
                  <FlowMap spreadSheetKey={match.params.sheetKey}/>
                  :
                  <NoWebGlFallback/>
              }</NoScroll>
            }
          />
          <Route path="/" component={Intro} />
        </Switch>
      </BrowserRouter>
    )
  }
}

