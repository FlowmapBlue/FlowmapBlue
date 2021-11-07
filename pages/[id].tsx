import * as React from 'react';
import { useRouter } from 'next/router';
import { SPREADSHEET_KEY_RE } from '../components/constants';
import DefaultErrorPage from 'next/error';
import Nav from '../components/Nav';
import ClientSide from '../components/ClientSide';

// import dynamic from 'next/dynamic';
// import { LoadingSpinner } from '../core';
// import { Suspense } from 'react';

import GSheetsFlowMap from '../components/GSheetsFlowMap';
// const GSheetsFlowMap = dynamic(() => import('../components/GSheetsFlowMap'), {
// //  TODO: enable once React 18 is released
// suspense: false,
// });

export interface Props {
  embed?: boolean;
}

const FlowMapPage: React.FC<Props> = (props) => {
  const { embed } = props;
  const router = useRouter();
  const { id, sheet } = router.query;
  const spreadsheetKey = id ? `${id}` : null;

  if (spreadsheetKey && !new RegExp(SPREADSHEET_KEY_RE).test(spreadsheetKey)) {
    return (
      <>
        <Nav />
        <DefaultErrorPage statusCode={404} />
      </>
    );
  }
  // return (
  //   <Suspense fallback={<LoadingSpinner />}>
  //     <GSheetsFlowMap
  //       spreadSheetKey={`${id ?? ''}`}
  //       flowsSheetKey={`${sheet ?? ''}`}
  //       embed={embed ? true : false}
  //     />
  //   </Suspense>
  // );
  return (
    <ClientSide
      render={() => (
        <GSheetsFlowMap
          spreadSheetKey={`${id ?? ''}`}
          flowsSheetKey={`${sheet ?? ''}`}
          embed={embed ? true : false}
        />
      )}
    />
  );
};

export default FlowMapPage;
