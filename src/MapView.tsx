import * as React from 'react'
import FlowMap from './FlowMap';
import sheetFetcher, { makeSheetQueryUrl } from './sheetFetcher';
import { PromiseState } from 'react-refetch';
import { Config, ConfigProp, ConfigPropName } from './types';
import { Absolute } from './Boxes';
import LoadingSpinner from './LoadingSpinner';
import Logo from './Logo';
import { Helmet } from 'react-helmet';
import NoScrollContainer from './NoScrollContainer';
import sendEvent from './ga';

interface Props {
  spreadSheetKey: string
}

type PropsWithData = Props & {
  configFetch: PromiseState<Config>,
}


const DEFAULT_MAP_STYLE =
  // 'mapbox://styles/ilyabo/cjtq7opq60xpi1fob4m0zbxeq';
  // 'mapbox://styles/mapbox/light-v8';
  'mapbox://styles/mapbox/light-v10';

const DEFAULT_CONFIG: Config = {
  [ConfigPropName.MAPBOX_ACCESS_TOKEN]: process.env.REACT_APP_MapboxAccessToken,
  [ConfigPropName.TITLE]: undefined,
  [ConfigPropName.AUTHOR_NAME]: undefined,
  [ConfigPropName.AUTHOR_URL]: undefined,
  [ConfigPropName.SOURCE_NAME]: undefined,
  [ConfigPropName.SOURCE_URL]: undefined,
  [ConfigPropName.DESCRIPTION]: undefined,
  [ConfigPropName.MAP_BBOX]: undefined,
  [ConfigPropName.MAPBOX_MAP_STYLE]: DEFAULT_MAP_STYLE,
  [ConfigPropName.IGNORE_ERRORS]: undefined,
  [ConfigPropName.COLORS_SCHEME]: undefined,
}


const MapView = ({ spreadSheetKey, configFetch }: PropsWithData) => {
  return (
    <NoScrollContainer>
      {configFetch.pending || configFetch.refreshing ?
        <LoadingSpinner/>
        :
        <FlowMap
          animate={true}
          spreadSheetKey={spreadSheetKey}
          config={configFetch.fulfilled ? configFetch.value : DEFAULT_CONFIG}
        />
      }
      <Absolute top={10} left={10}>
        <Logo />
      </Absolute>
      {configFetch.fulfilled && configFetch.value[ConfigPropName.TITLE] &&
      <Helmet>
        <title>{`${configFetch.value[ConfigPropName.TITLE]} - flowmap.blue`}</title>
      </Helmet>
      }
    </NoScrollContainer>
  )
}

export default sheetFetcher<any>(({ spreadSheetKey }: Props) => ({
  configFetch: {
    url: makeSheetQueryUrl(spreadSheetKey, 'properties', 'SELECT A,B'),
    then: (props: ConfigProp[]) => {
      const value = {...DEFAULT_CONFIG}
      for (const prop of props) {
        if (prop.value != null && `${prop.value}`.length > 0) {
          value[prop.property] = prop.value
        }
      }
      sendEvent(
        `${spreadSheetKey} "${value[ConfigPropName.TITLE] || 'Untitled'}"`,
        `Load config`,
        `Load config "${value[ConfigPropName.TITLE] || 'Untitled'}"`,
      )
      return { value }
    },
  } as any
}))(MapView)
