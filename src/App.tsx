import * as React from 'react'
import { BrowserRouter, Route, Switch, RouteComponentProps } from 'react-router-dom'
import FlowMap from './FlowMap'
import Intro from './Intro'

export default class App extends React.Component {

  render() {
    return (
      <BrowserRouter>
        <Switch>
          <Route
            path="/:sheetKey([a-zA-Z0-9-_]{44})"
            component={({ match }: RouteComponentProps<{ sheetKey: string }>) =>
              <FlowMap sheetKey={match.params.sheetKey}/>
            }
          />
          <Route path="/" component={Intro} />
        </Switch>
      </BrowserRouter>
    )
  }
}

