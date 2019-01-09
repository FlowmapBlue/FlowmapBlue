import * as React from 'react'
import * as ReactDOM from 'react-dom'
import App from './App'

import 'mapbox-gl/dist/mapbox-gl.css'
import './styles.css'
import checkWebglSupport from './checkWebglSupport';

ReactDOM.render(<App supportsWebGl={checkWebglSupport()} />, document.getElementById('root'))
