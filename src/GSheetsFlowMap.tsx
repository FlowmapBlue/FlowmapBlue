import * as React from 'react';
import sheetFetcher, { makeSheetQueryUrl } from './sheetFetcher';
import { PromiseState } from 'react-refetch';
import { Config, ConfigProp, ConfigPropName, Flow, Location } from './types';
import LoadingSpinner from './LoadingSpinner';
import { Helmet } from 'react-helmet';
import sendEvent from './ga';
import { DEFAULT_CONFIG } from './config';
import FlowMap, {
  ErrorsLocationsBlock,
  MAX_NUM_OF_IDS_IN_ERROR,
  Props as FlowMapProps,
} from './FlowMap';
import MapContainer from './MapContainer';
import { nest } from 'd3-collection';
import { AppToaster } from './AppToaster';
import { Intent } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { ToastContent } from './Boxes';
import { useEffect, useState } from 'react';
import { getFlowsSheets } from './FlowMap.selectors';
import { parseTime } from './time';
import { prepareFlows } from './prepareFlows';

interface Props {
  spreadSheetKey: string;
  embed: boolean;
}

type PropsWithData = Props & {
  configFetch: PromiseState<Config>;
};

const FlowMapWithData = sheetFetcher('json')<any>(
  ({ spreadSheetKey, config, flowsSheet = 'flows' }: FlowMapProps) => ({
    locationsFetch: {
      url: makeSheetQueryUrl(spreadSheetKey!, 'locations', 'SELECT A,B,C,D', 'json'),
      then: (rows: any[]) => ({
        value: rows.map(
          ({ id, time, name, lon, lat }: any) =>
            ({
              id: `${id}`,
              name: name ?? id,
              lon: +lon,
              lat: +lat,
            } as Location)
        ),
      }),
    } as any,
    flowsFetch: {
      url: makeSheetQueryUrl(spreadSheetKey!, flowsSheet, 'SELECT *', 'json'),
      refreshing: true,
      then: (rows: any[]) => ({
        value: prepareFlows(rows),
      }),
    } as any,
  })
)(FlowMap as any);

const GSheetsFlowMap = sheetFetcher('csv')<any>(({ spreadSheetKey }: Props) => ({
  configFetch: {
    url: makeSheetQueryUrl(spreadSheetKey, 'properties', 'SELECT A,B', 'csv'),
    then: (props: ConfigProp[]) => {
      const value = { ...DEFAULT_CONFIG };
      for (const prop of props) {
        if (prop.value != null && `${prop.value}`.length > 0) {
          value[prop.property] = prop.value;
        }
      }
      sendEvent(
        `${spreadSheetKey} "${value[ConfigPropName.TITLE] || 'Untitled'}"`,
        `Load config`,
        `Load config "${value[ConfigPropName.TITLE] || 'Untitled'}"`
      );
      return { value };
    },
  } as any,
}))(({ spreadSheetKey, embed, configFetch }: PropsWithData) => {
  const flowsSheets = configFetch.fulfilled ? getFlowsSheets(configFetch.value) : undefined;
  const [flowsSheet, setFlowsSheet] = useState<string>();
  useEffect(() => {
    if (flowsSheet == null) {
      if (flowsSheets && flowsSheets.length > 0) {
        setFlowsSheet(flowsSheets[0]);
      }
    }
  }, [flowsSheets, flowsSheet]);
  const handleSetFlowsSheet = (sheet: string) => {
    setFlowsSheet(sheet);
  };
  return (
    <MapContainer embed={embed}>
      {configFetch.pending || configFetch.refreshing ? (
        <LoadingSpinner />
      ) : (
        <FlowMapWithData
          animate={true}
          spreadSheetKey={spreadSheetKey}
          embed={embed}
          config={configFetch.fulfilled ? configFetch.value : DEFAULT_CONFIG}
          flowsSheet={flowsSheet}
          onSetFlowsSheet={handleSetFlowsSheet}
        />
      )}
      {configFetch.fulfilled && configFetch.value[ConfigPropName.TITLE] && (
        <Helmet>
          <title>{`${configFetch.value[ConfigPropName.TITLE]} - Flowmap.blue`}</title>
          <link href={`https://flowmap.blue/${spreadSheetKey}`} rel="canonical" />
        </Helmet>
      )}
    </MapContainer>
  );
});

export default GSheetsFlowMap;
