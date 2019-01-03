import * as React from 'react'
import FlowMap from './FlowMap'


export default class App extends React.Component {

  render() {
    return (
      <FlowMap sheetKey={window.location.pathname.substr(1)} />
    )
  }
}
