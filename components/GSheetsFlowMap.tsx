import * as React from 'react';
import { useEffect, useState } from 'react';
import sheetFetcher, { makeSheetQueryUrl } from './sheetFetcher';
import FlowMap, {
  AppToaster,
  ConfigProp,
  ConfigPropName,
  DEFAULT_CONFIG,
  getFlowsSheets,
  LoadingSpinner,
  Location,
  MapContainer,
  prepareFlows,
  Props as FlowMapProps,
} from '../core';
import Head from 'next/head';
import sendEvent from './ga';
import { useAsync } from 'react-use';
import { csvParse } from 'd3-dsv';
import { Intent } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { compose, withProps } from 'recompose';
import styled from '@emotion/styled';
import { useRouter } from 'next/router';
import { getFlowsSheetKey } from './constants';

interface Props {
  spreadSheetKey: string;
  flowsSheetKey?: string;
  embed: boolean;
}

const ToastContent = styled.div`
  font-size: 12px;
`;

const FlowMapWithData = compose<any, any>(
  sheetFetcher('json')<any>(({ spreadSheetKey, config, flowsSheet = 'flows' }: FlowMapProps) => ({
    locationsFetch: {
      url: makeSheetQueryUrl(spreadSheetKey!, 'locations', 'SELECT A,B,C,D', 'json'),
      then: (rows: any[]) => ({
        value: rows.map(
          ({ id, name, lon, lat }: any) =>
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
  })),
  withProps((props: any) => ({
    locationsFetch: {
      ...props.locationsFetch,
      loading: props.locationsFetch.pending || props.locationsFetch.refreshing,
    },
    flowsFetch: {
      ...props.flowsFetch,
      loading: props.flowsFetch.pending || props.flowsFetch.refreshing,
    },
  }))
)(FlowMap as any);

const GSheetsFlowMap: React.FC<Props> = ({ spreadSheetKey, flowsSheetKey, embed }) => {
  const url = makeSheetQueryUrl(spreadSheetKey, 'properties', 'SELECT A,B', 'csv');
  const [flowsSheet, setFlowsSheet] = useState<string>();
  const router = useRouter();

  const handleChangeFlowsSheet = (name: string, replaceUrl: boolean) => {
    if (replaceUrl) {
      const query = {
        ...router.query,
        id: spreadSheetKey,
        sheet: getFlowsSheetKey(name),
      };
      router.replace({
        pathname: `/[id]/[sheet]/${embed ? '/embed' : ''}`,
        query: query,
      });
    }
    setFlowsSheet(name);
  };

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
      let name = undefined;
      if (flowsSheetKey) {
        name = flowsSheets.find((fs) => getFlowsSheetKey(fs) === flowsSheetKey);
      } else {
        name = flowsSheets[0];
      }
      if (name != null) {
        handleChangeFlowsSheet(name, flowsSheets.length > 1);
      }
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
            Oops… The properties sheet could not be loaded:
            <br />
            {configFetch.error.message}
          </ToastContent>
        ),
      });
    }
  }, [configFetch.error]);

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
          onSetFlowsSheet={(name: string) => handleChangeFlowsSheet(name, true)}
        />
      )}
      {configFetch.value && configFetch.value[ConfigPropName.TITLE] && (
        <Head>
          <title>{`${configFetch.value[ConfigPropName.TITLE]} - Flowmap.blue`}</title>
          <link href={`https://flowmap.blue/${spreadSheetKey}`} rel="canonical" />
        </Head>
      )}
    </MapContainer>
  );
};

export default GSheetsFlowMap;
