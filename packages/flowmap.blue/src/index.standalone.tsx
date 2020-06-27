import React from 'react';
import * as ReactDOM from 'react-dom';
import { DEFAULT_CONFIG } from './config';
import FlowMap from './FlowMap';
import { PromiseState } from 'react-refetch';
import { Location, Flow } from './types';
import MapContainer from './MapContainer';

export default function(
  locations: Location[],
  flows: Flow[],
  container: HTMLElement
) {
  ReactDOM.render(
    <MapContainer>
       <FlowMap
         inBrowser={true}
         flowsFetch={PromiseState.resolve(flows)}
         locationsFetch={PromiseState.resolve(locations)}
         config={DEFAULT_CONFIG}
         spreadSheetKey={undefined}
         flowsSheet={undefined}
       />
     </MapContainer>,
    container
  );
}
