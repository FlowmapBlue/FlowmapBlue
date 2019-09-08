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

export const DEFAULT_MAP_STYLE_LIGHT = 'mapbox://styles/mapbox/light-v10'
export const DEFAULT_MAP_STYLE_DARK = 'mapbox://styles/mapbox/dark-v10'

const DEFAULT_CONFIG: Config = {
  [ConfigPropName.MAPBOX_ACCESS_TOKEN]: process.env.REACT_APP_MapboxAccessToken,
  [ConfigPropName.TITLE]: undefined,
  [ConfigPropName.AUTHOR_NAME]: undefined,
  [ConfigPropName.AUTHOR_URL]: undefined,
  [ConfigPropName.SOURCE_NAME]: undefined,
  [ConfigPropName.SOURCE_URL]: undefined,
  [ConfigPropName.DESCRIPTION]: undefined,
  [ConfigPropName.MAP_BBOX]: undefined,
  [ConfigPropName.MAPBOX_MAP_STYLE]: undefined,
  [ConfigPropName.IGNORE_ERRORS]: undefined,
  [ConfigPropName.COLORS_SCHEME]: undefined,
  [ConfigPropName.COLORS_DARK_MODE]: undefined,
  [ConfigPropName.ANIMATE_FLOWS]: undefined,
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
        <link href={`https://flowmap.blue/${spreadSheetKey}`} rel="canonical" />
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

export function parseBoolConfigProp(value: string | undefined) {
  console.log(value)
  if (value != null) {
    const lower = value.toLowerCase()
    if (lower === 'yes' || lower === 'true' || lower === '1') return true
  }
  return false
}
