import React, { useCallback, useState } from 'react'
import Nav from './Nav';
import styled from '@emotion/styled';
import { Button, Classes, H5, HTMLSelect, Intent, TextArea } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { tsvFormatRows } from 'd3-dsv';
import { ascending } from 'd3-array';
import { connect, PromiseState } from 'react-refetch';
import md5 from 'blueimp-md5';
import COUNTRIES from './countries.json';

const countries = COUNTRIES as { [key: string]: string }

const ContentBody = styled.div`
  padding: 30px 30px;
  & h1 { font-size: 2rem; }
  & li { margin: 0.5em 0; }
  margin: auto;
  max-width: 1500px;
`

const SearchOptions = styled.div`
  display: flex;
  flex-direction: row;
  & > * + * { margin-left: 1rem; }
  margin-bottom: 0.5rem;
  align-items: center;
`

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
    white-space: nowrap;
    font-family: monospace;
  }
`

interface GeoCodingResult {
  query: string[]
  features?: {
    center: [number, number]
    place_name: string
  }[]
}

function prepareOutput(fetchStates: {
  name: string,
  fetchState: PromiseState<GeoCodingResult>
}[]) {
  const outputRows = [['id', 'name', 'lat', 'lon']]
  for (const { name, fetchState } of fetchStates) {
    if (!fetchState || fetchState.pending) {
      outputRows.push([name, 'Pending…'])
    } else if (fetchState.rejected) {
      outputRows.push([name, 'Failed'])
    } else if (fetchState.fulfilled) {
      const value = fetchState.value
      if (value && value.features && value.features.length > 0) {
        const firstFound = value.features[0]
        outputRows.push([
          name,
          firstFound.place_name,
          `${firstFound.center[1]}`,
          `${firstFound.center[0]}`,
        ])
      } else {
        outputRows.push([name, 'Not found'])
      }
    }
  }
  return tsvFormatRows(outputRows)
}

const baseURL = 'https://api.mapbox.com/geocoding/v5/mapbox.places/'
const accessToken = process.env.REACT_APP_MapboxAccessToken

interface GeoCoderProps {
  names: string[]
  country: string
  locationType: string
}
const GeoCoder = connect(({ names, country, locationType }: GeoCoderProps) => {
  const fetches: { [key: string]: string } = {}
  for (const name of names) {
    fetches[md5(name)] =
      `${baseURL}${encodeURIComponent(name)}.json?`+
      (country.length > 0 ? `country=${country}&` : '')+
      (locationType.length > 0 ? `types=${locationType}&` : '')+
      `access_token=${accessToken}`
  }
  return fetches
})((props: GeoCoderProps) => {
  const output = prepareOutput(
    props.names.map(
      name => ({
        name,
        fetchState: (props as any)[md5(name)] as PromiseState<GeoCodingResult>,
      })
    )
  )
  return (
    <TextArea
      growVertically={false}
      large={true}
      intent={Intent.PRIMARY}
      onChange={console.log}
      value={output}
    />
  )
})

const Geocoding = () => {
  const [input, setInput] = useState(
    ['Paris', 'London', 'New York'].join('\n')
  )
  const [country, setCountry] = useState('')
  const [locationType, setLocationType] = useState('')
  const [geoCoderParams, setGeoCoderParams] = useState<GeoCoderProps>({
    names: [],
    country: '',
    locationType: '',
  })
  const handleStart = useCallback(
    () => {
      setGeoCoderParams({
        names: input.split('\n'),
        country,
        locationType,
      })
    },
    [input, country, locationType]
  )
  return (
    <>
      <Nav />
      <ContentBody className={Classes.DARK}>
        <h1>Geocoding</h1>
        <section>
          <p>
            Find coordinates for locations by their names.
          </p>
        </section>
        <Container>
          <H5>Enter location names here (one per line)</H5>
          <span/>
          <div>
            <SearchOptions>
              <span>Limit search to</span>
              <HTMLSelect
                fill={false}
                value={undefined}
                options={[
                    {
                      value: '',
                      label: 'any country'
                    },
                    ...Object
                      .keys(countries)
                      .map(key => ({
                        label: countries[key],
                        value: key,
                      }))
                      .sort((a, b) => ascending(a.label, b.label))
                  ]}
                onChange={event => setCountry(event.currentTarget.value)}
              />
              <HTMLSelect
                fill={false}
                value={undefined}
                options={[
                    {
                      value: '',
                      label: 'any location type'
                    },
                    ...[
                      'country', 'region', 'postcode', 'district', 'place', 'locality',
                      'neighborhood', 'address', 'poi'
                    ]
                      .map(key => ({
                        label: key,
                        value: key,
                      }))
                  ]}
                onChange={event => setLocationType(event.currentTarget.value)}
              />
            </SearchOptions>
          </div>
          <TextArea
            growVertically={false}
            large={true}
            intent={Intent.PRIMARY}
            onChange={event => setInput(event.target.value)}
            value={input}
          />
          <Button
            large={true}
            icon={IconNames.ARROW_RIGHT}
            rightIcon={IconNames.ARROW_RIGHT}
            onClick={handleStart}
          >Start</Button>
          <GeoCoder
            {...geoCoderParams}
          />
        </Container>
        <br/>
        <section>
          <p>You can copy-paste these data directly from and to your Google spreadsheet.</p>
        </section>
      </ContentBody>
    </>
  )
}

export default Geocoding
