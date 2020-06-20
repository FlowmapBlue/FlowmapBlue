import * as React from 'react';
import { useEffect, useState } from 'react';
import sheetFetcher, { makeSheetQueryUrl } from './sheetFetcher';
import { ConfigProp, ConfigPropName, Location } from './types';
import LoadingSpinner from './LoadingSpinner';
import { Helmet } from 'react-helmet';
import sendEvent from './ga';
import { DEFAULT_CONFIG } from './config';
import FlowMap, { Props as FlowMapProps } from './FlowMap';
import MapContainer from './MapContainer';
import { getFlowsSheets } from './FlowMap.selectors';
import { prepareFlows } from './prepareFlows';
import { useAsync } from 'react-use';
import { csvParse } from 'd3-dsv';
import { AppToaster } from './AppToaster';
import { Intent } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { ToastContent } from './Boxes';

interface Props {
  spreadSheetKey: string;
  embed: boolean;
}

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

const GSheetsFlowMap: React.FC<Props> = ({ spreadSheetKey, embed }) => {
  const url = makeSheetQueryUrl(spreadSheetKey, 'properties', 'SELECT A,B', 'csv');
  const [flowsSheet, setFlowsSheet] = useState<string>();

  const configFetch = useAsync(async () => {
    const response = await fetch(url);
    const rows = csvParse(await response.text()) as ConfigProp[];
    const configProps = { ...DEFAULT_CONFIG };
    for (const prop of rows) {
      if (prop.value != null && `${prop.value}`.length > 0) {
        configProps[prop.property] = prop.value;
      }
    }
    sendEvent(
      `${spreadSheetKey} "${configProps[ConfigPropName.TITLE] || 'Untitled'}"`,
      `Load config`,
      `Load config "${configProps[ConfigPropName.TITLE] || 'Untitled'}"`
    );
    const flowsSheets = getFlowsSheets(configProps);
    if (flowsSheets && flowsSheets.length > 0) {
      setFlowsSheet(flowsSheets[0]);
    }
    return configProps;
  }, [url]);

  useEffect(() => {
    if (configFetch.error) {
      AppToaster.show({
        intent: Intent.WARNING,
        icon: IconNames.WARNING_SIGN,
        timeout: 0,
        message: (
          <ToastContent>
            Oops… The properties sheet couldn't be loaded:
            <br />
            {configFetch.error.message}
          </ToastContent>
        ),
      });
    }
  }, [configFetch.error]);

  const handleSetFlowsSheet = (sheet: string) => {
    setFlowsSheet(sheet);
  };
  return (
    <MapContainer embed={embed}>
      {configFetch.loading ? (
        <LoadingSpinner />
      ) : (
        <FlowMapWithData
          spreadSheetKey={spreadSheetKey}
          embed={embed}
          config={configFetch.value ? configFetch.value : DEFAULT_CONFIG}
          flowsSheet={flowsSheet}
          onSetFlowsSheet={handleSetFlowsSheet}
        />
      )}
      {configFetch.value && configFetch.value[ConfigPropName.TITLE] && (
        <Helmet>
          <title>{`${configFetch.value[ConfigPropName.TITLE]} - Flowmap.blue`}</title>
          <link href={`https://flowmap.blue/${spreadSheetKey}`} rel="canonical" />
        </Helmet>
      )}
    </MapContainer>
  );
};

export default GSheetsFlowMap;
