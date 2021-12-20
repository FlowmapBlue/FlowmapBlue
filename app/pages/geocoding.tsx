import React, {useCallback, useState} from 'react';
import styled from '@emotion/styled';
import {Button, H5, HTMLSelect, Intent, TextArea} from '@blueprintjs/core';
import {IconNames} from '@blueprintjs/icons';
import {dsvFormat} from 'd3-dsv';
import {ascending} from 'd3-array';
import {connect, PromiseState} from 'react-refetch';
import md5 from 'blueimp-md5';
import COUNTRIES from '../../countries.json';
import {AppToaster} from '../core';
import Layout from '../core/Layout';
import Head from 'next/head';

const MAX_GEOCODING_ROWS = 1000;
const countries = COUNTRIES as {[key: string]: string};

const SearchOptions = styled.div`
  display: grid;
  flex-direction: row;
  column-gap: 1rem;
  grid-template-columns: min-content 1fr 1fr min-content min-content;
  margin-bottom: 0.5rem;
  align-items: center;
  & select {
    min-width: 60px;
  }
`;

const Nowrap = styled.span`
  white-space: nowrap;
`;

const Container = styled.div`
  display: grid;
  grid-template-columns: 1fr min-content 2fr;
  grid-template-rows: min-content 1fr;
  column-gap: 1rem;
  row-gap: 0.2rem;
  align-items: center;
  & > textarea {
    min-height: 300px;
    height: 100%;
    font-size: 12px !important;
    font-family: monospace;
    white-space: pre;
  }
`;

interface GeoCodingResult {
  query: string[];
  features?: {
    center: [number, number];
    place_name: string;
  }[];
}

function prepareOutput(
  fetchStates: {
    name: string;
    fetchState: PromiseState<GeoCodingResult>;
  }[],
  delimiter: string,
) {
  const outputRows = [['id', 'name', 'lat', 'lon']];
  for (const {name, fetchState} of fetchStates) {
    if (!fetchState || fetchState.pending) {
      outputRows.push([name, 'Pending…']);
    } else if (fetchState.rejected) {
      outputRows.push([name, 'Failed']);
    } else if (fetchState.fulfilled) {
      const value = fetchState.value;
      if (value && value.features && value.features.length > 0) {
        const firstFound = value.features[0];
        outputRows.push([
          name,
          firstFound.place_name,
          `${firstFound.center[1]}`,
          `${firstFound.center[0]}`,
        ]);
      } else {
        outputRows.push([name, 'Not found']);
      }
    }
  }
  return dsvFormat(delimiter).formatRows(outputRows);
}

const baseURL = 'https://api.mapbox.com/geocoding/v5/mapbox.places/';
const accessToken = process.env.NEXT_PUBLIC_MapboxAccessToken;

interface GeoCoderProps {
  names: string[];
  country: string;
  locationType: string;
  delimiter: string;
}
const GeoCoder = connect(({names, country, locationType}: GeoCoderProps) => {
  const fetches: {[key: string]: string} = {};
  for (const name of names) {
    fetches[md5(name)] =
      `${baseURL}${encodeURIComponent(name)}.json?` +
      (country.length > 0 ? `country=${country}&` : '') +
      (locationType.length > 0 ? `types=${locationType}&` : '') +
      `access_token=${accessToken}`;
  }
  return fetches;
})((props: GeoCoderProps) => {
  const output = prepareOutput(
    props.names.map((name) => ({
      name,
      fetchState: (props as any)[md5(name)] as PromiseState<GeoCodingResult>,
    })),
    props.delimiter,
  );
  return (
    <TextArea
      growVertically={false}
      large={true}
      intent={Intent.PRIMARY}
      onChange={() => undefined}
      value={output}
    />
  );
});

const ToastContent = styled.div`
  font-size: 12px;
`;

const Geocoding = () => {
  const [input, setInput] = useState(['Paris', 'London', 'New York'].join('\n'));
  const [country, setCountry] = useState('');
  const [outputDelimiter, setOutputDelimiter] = useState('\t');
  const [locationType, setLocationType] = useState('');
  const [geoCoderParams, setGeoCoderParams] = useState<GeoCoderProps>({
    names: [],
    country: '',
    locationType: '',
    delimiter: '\t',
  });
  const handleStart = useCallback(() => {
    const names = input.split('\n');
    if (names.length > MAX_GEOCODING_ROWS) {
      AppToaster.show({
        intent: Intent.DANGER,
        icon: IconNames.WARNING_SIGN,
        timeout: 7000,
        message: (
          <ToastContent>
            {`Sorry, the geocoding requests are not free for us, hence, we
           have to limit them to ${MAX_GEOCODING_ROWS} max.`}
          </ToastContent>
        ),
      });
      return null;
    }
    setGeoCoderParams({
      names,
      country,
      locationType,
      delimiter: outputDelimiter,
    });
  }, [input, country, locationType, outputDelimiter]);
  return (
    <Layout>
      <h1>Geocoding</h1>
      <Head>
        <title>Geocoding – Flowmap.blue</title>
      </Head>
      <section>
        <p>Find geographic coordinates of locations by their names.</p>
      </section>
      <Container>
        <H5>Location names (one per line)</H5>
        <span />
        <div>
          <SearchOptions>
            <Nowrap>Limit search to</Nowrap>
            <HTMLSelect
              fill={false}
              value={undefined}
              options={[
                {
                  value: '',
                  label: 'any country',
                },
                ...Object.keys(countries)
                  .map((key) => ({
                    label: countries[key],
                    value: key,
                  }))
                  .sort((a, b) => ascending(a.label, b.label)),
              ]}
              onChange={(event) => setCountry(event.currentTarget.value)}
            />
            <HTMLSelect
              fill={false}
              value={undefined}
              options={[
                {
                  value: '',
                  label: 'any location type',
                },
                ...[
                  'country',
                  'region',
                  'postcode',
                  'district',
                  'place',
                  'locality',
                  'neighborhood',
                  'address',
                  'poi',
                ].map((key) => ({
                  label: key,
                  value: key,
                })),
              ]}
              onChange={(event) => setLocationType(event.currentTarget.value)}
            />
            <span>as</span>
            <HTMLSelect
              fill={false}
              value={outputDelimiter}
              options={[
                {
                  value: '\t',
                  label: 'TSV',
                },
                {
                  value: ',',
                  label: 'CSV',
                },
              ]}
              onChange={(event) => setOutputDelimiter(event.currentTarget.value)}
            />
          </SearchOptions>
        </div>
        <TextArea
          growVertically={false}
          large={true}
          intent={Intent.PRIMARY}
          onChange={(event) => setInput(event.target.value)}
          value={input}
        />
        <Button
          large={true}
          icon={IconNames.ARROW_RIGHT}
          rightIcon={IconNames.ARROW_RIGHT}
          onClick={handleStart}
        >
          Geocode
        </Button>
        <GeoCoder {...geoCoderParams} />
      </Container>
      <br />
      <section>
        <p>You can copy-paste these data directly from and to your Google spreadsheet.</p>
      </section>
    </Layout>
  );
};

export default Geocoding;
