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
import { Button, Classes, Colors, Intent } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import styled from '@emotion/styled';

const ButtonArea = styled.div({
  marginTop: 10,
  '@media (min-width: 520px)': {
    marginTop: -10,
  },
})
const globalStyles = css`
html, body, button, select {
  margin: 0;
  background: ${Colors.DARK_GRAY4}; 
  font-family: 'Sarabun', sans-serif; 
  font-size: 13pt;
}
 
a, a:visited { color: ${ColorScheme.primary}; }
.${Classes.DARK} {
  a, a:visited { color: ${Colors.BLUE5}; }
}

.mapboxgl-control-container {
  a, a:visited { color: ${Colors.DARK_GRAY1}; }
}

section { margin-bottom: 4em;  }
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

try {
  if (window.localStorage &&
    window.localStorage.getItem('privacyPolicyAccepted') !== 'true') {
    AppToaster.show({
      intent: Intent.PRIMARY,
      icon: IconNames.INFO_SIGN,
      timeout: 0,
      message:
      <div style={{ display: 'flex', alignItems: 'flex-end', flexDirection: 'column' }}>
        <div style={{ fontSize: 14, }}>
          We use cookies to <b>collect usage statistics</b> on this website.
          This really helps us to improve the app.
          If you use flowmap.blue, we assume that you agree with our <b>very short</b> <a href="/#privacy">Privacy policy</a>.
        </div>
        <ButtonArea>
          <Button
            intent={Intent.PRIMARY}
            onClick={() => {
              window.localStorage.setItem('privacyPolicyAccepted', 'true')
              AppToaster.dismiss('privacy')
            }}
          >Accept
          </Button>
        </ButtonArea>
      </div>
    }, 'privacy')
  }
} catch (err) {
  // a SecurityError will be thrown if "Block third-party cookies and site data"
  // is enabled in the browser settings
  console.error(err)
}
