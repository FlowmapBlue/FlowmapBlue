import * as React from 'react'
import sheetFetcher, { makeSheetQueryUrl } from './sheetFetcher';
import { PromiseState } from 'react-refetch';
import { Config, ConfigProp, ConfigPropName, Flow, Location } from './types';
import LoadingSpinner from './LoadingSpinner';
import { Helmet } from 'react-helmet';
import sendEvent from './ga';
import { DEFAULT_CONFIG } from './config';
import FlowMap, { Props as FlowMapProps } from './FlowMap';
import MapContainer from './MapContainer';

interface Props {
  spreadSheetKey: string
  embed: boolean
}

type PropsWithData = Props & {
  configFetch: PromiseState<Config>,
}


const FlowMapWithData = sheetFetcher<any>(({ spreadSheetKey, config }: FlowMapProps) => ({
  locationsFetch: {
    url: makeSheetQueryUrl(spreadSheetKey!, 'locations', 'SELECT A,B,C,D'),
    then: (rows: any[]) => ({
      value: rows.map(({ id, name, lon, lat }: any) => ({
        id: `${id}`, name, lon: +lon, lat: +lat,
      } as Location))
    })
  } as any,
  flowsFetch: {
    url: makeSheetQueryUrl(spreadSheetKey!, 'flows', 'SELECT A,B,C'),
    then: (rows: any[]) => ({
      value: rows.map(({ origin, dest, count }: any) => ({
        origin, dest, count: +count,
      } as Flow))
    })
  } as any,
}))(FlowMap as any);


const GSheetsFlowMap = sheetFetcher<any>(({ spreadSheetKey }: Props) => ({
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
}))(({ spreadSheetKey, embed, configFetch }: PropsWithData) => {
  return (
    <MapContainer embed={embed}>
      {configFetch.pending || configFetch.refreshing ?
        <LoadingSpinner/>
        :
        <FlowMapWithData
          animate={true}
          spreadSheetKey={spreadSheetKey}
          embed={embed}
          config={configFetch.fulfilled ? configFetch.value : DEFAULT_CONFIG}
        />
      }
      {configFetch.fulfilled && configFetch.value[ConfigPropName.TITLE] &&
      <Helmet>
        <title>{`${configFetch.value[ConfigPropName.TITLE]} - flowmap.blue`}</title>
        <link href={`https://flowmap.blue/${spreadSheetKey}`} rel="canonical" />
      </Helmet>
      }
    </MapContainer>
  )
})

export default GSheetsFlowMap
