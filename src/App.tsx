import * as React from 'react'
import FlowMap from './FlowMap'
import Intro from './Intro'

export default class App extends React.Component {

  render() {
    const sheetKey = window.location.pathname.substr(1)
    if (!/[a-zA-Z0-9-_]+/.test(sheetKey)) {
      return <Intro/>
    }
    return (
      <FlowMap sheetKey={sheetKey} />
    )
  }
}

