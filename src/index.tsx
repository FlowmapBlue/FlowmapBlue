import 'react-app-polyfill/ie11'
import 'react-app-polyfill/stable'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import App from './App'
import { Global, css } from '@emotion/core'
import * as Sentry from '@sentry/browser'

import '@blueprintjs/core/lib/css/blueprint.css'
import '@blueprintjs/select/lib/css/blueprint-select.css'
import '@blueprintjs/icons/lib/css/blueprint-icons.css'
import 'mapbox-gl/dist/mapbox-gl.css'
import checkWebglSupport from './checkWebglSupport'
import { ColorScheme } from './colors'
import { AppToaster } from './AppToaster';
import { Button, Intent } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';

const globalStyles = css`
html, body, button { 
  font-family: 'Sarabun', sans-serif; 
  font-size: 13pt;
}
a, a:visited { color: ${ColorScheme.primary}; }

section { margin-bottom: 3em; line-height: 1.5em; }
#no-token-warning { bottom: 30px; top: unset !important; left: 10px !important; }
`

if (process.env.REACT_APP_SENTRY_DSN) {
  Sentry.init({
   dsn: process.env.REACT_APP_SENTRY_DSN
  })
}

ReactDOM.render(
  <>
    <Global styles={globalStyles} />
    <App supportsWebGl={checkWebglSupport()} />
  </>,
  document.getElementById('root')
)

if (window.localStorage &&
  window.localStorage.getItem('privacyPolicyAccepted') !== 'true') {
  AppToaster.show({
    intent: Intent.PRIMARY,
    icon: IconNames.INFO_SIGN,
    timeout: 0,
    message:
    <div style={{ display: 'flex', alignItems: 'flex-end', flexDirection: 'column' }}>
      <div style={{ fontSize: 14, }}>
        For continuing to improve flowmap.blue we need to know how it is used.
        We use cookies to collect anonymous usage statistics on the website.
        If you use flowmap.blue, we assume that you agree with that.
        For more information, please refer to our <a href="/#privacy">Privacy notice</a>.
      </div>
      <div style={{ marginTop: 10 }}>
        <Button
          intent={Intent.PRIMARY}
          onClick={() => {
            window.localStorage.setItem('privacyPolicyAccepted', 'true')
            AppToaster.dismiss('privacy')
          }}
        >Yes, I agree
        </Button>
      </div>
    </div>
  }, 'privacy')
}
