import React, {FC, useEffect} from 'react';
import useFetch from 'react-fetch-hook';
import {PromiseState} from 'react-refetch';
import FlowMap, {
  ConfigPropName,
  DEFAULT_CONFIG,
  LoadingSpinner,
  MapContainer,
  prepareFlows,
} from '../core';
import {csvParse} from 'd3-dsv';
import ErrorFallback from '../components/ErrorFallback';
import {useMemo} from 'react';
import {useRouter} from 'next/router';
import sendEvent from 'components/sendEvent';

type Props = {
  locationsUrl: string;
  flowsUrl: string;
  params: Record<string, string | string[] | undefined>;
};
const FromUrlFlowMap: FC<Props> = (props) => {
  const {locationsUrl, flowsUrl, params} = props;
  const config = useMemo(() => {
    const config = {...DEFAULT_CONFIG};
    for (const prop of Object.values(ConfigPropName)) {
      const val = params[prop];
      if (typeof val === 'string' && val.length > 0) {
        config[prop] = val;
      }
    }
    return config;
  }, [params]);

  const fetchFlows = useFetch(flowsUrl, {
    formatter: (response) =>
      response.text().then((text) =>
        csvParse(text, (row: any) => ({
          ...row,
          count: +row.count,
        })),
      ),
  });
  const fetchLocations = useFetch(locationsUrl, {
    formatter: (response) =>
      response.text().then((text) =>
        csvParse(text, (row: any) => ({
          ...row,
          lat: +row.lat,
          lon: +row.lon,
        })),
      ),
  });

  useEffect(() => {
    if (fetchFlows.data && fetchLocations.data) {
      sendEvent('from-url', 'Untitled');
    }
  }, [fetchFlows.data, fetchLocations.data]);

  if (fetchLocations.error) {
    return <ErrorFallback error={fetchLocations.error} />;
  }

  if (fetchFlows.error) {
    return <ErrorFallback error={fetchFlows.error} />;
  }

  if (fetchLocations.isLoading || fetchFlows.isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <MapContainer>
      <FlowMap
        inBrowser={true}
        flowsSheet={undefined}
        flowsFetch={PromiseState.resolve(prepareFlows(fetchFlows.data as any[]))}
        locationsFetch={PromiseState.resolve(fetchLocations.data)}
        config={config}
        spreadSheetKey={undefined}
      />
    </MapContainer>
  );
};

export default function FromUrlFlowMapPage() {
  const router = useRouter();
  const {locations, flows, ...params} = router.query;
  return typeof locations === 'string' && typeof flows === 'string' ? (
    <FromUrlFlowMap locationsUrl={locations} flowsUrl={flows} params={params} />
  ) : null;
}
