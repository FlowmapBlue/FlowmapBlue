import * as React from 'react'
import { BrowserRouter, Route, Switch, RouteComponentProps } from 'react-router-dom'
import FlowMap from './FlowMap'
import Intro from './Intro'
import NoWebGlFallback from './NoWebGlFallback';

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
              supportsWebGl ?
                <FlowMap spreadSheetKey={match.params.sheetKey}/>
                :
                <NoWebGlFallback />
            }
          />
          <Route path="/" component={Intro} />
        </Switch>
      </BrowserRouter>
    )
  }
}

