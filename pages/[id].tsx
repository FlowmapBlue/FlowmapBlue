import * as React from 'react';
import GSheetsFlowMap from '../components/GSheetsFlowMap';
import { useRouter } from 'next/router';
import { SPREADSHEET_KEY_RE } from '../components/constants';
import DefaultErrorPage from 'next/error';
import Nav from '../components/Nav';
import ClientSide from '../components/ClientSide';

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
