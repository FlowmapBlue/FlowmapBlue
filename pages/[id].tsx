import * as React from 'react';
import {useRouter} from 'next/router';
import {SPREADSHEET_KEY_RE} from '../components/constants';
import DefaultErrorPage from 'next/error';
import Nav from '../components/Nav';

import GSheetsFlowMap from '../components/GSheetsFlowMap';

export interface Props {
  embed?: boolean;
}

const FlowMapPage: React.FC<Props> = (props) => {
  const {embed} = props;
  const router = useRouter();
  const {id, sheet} = router.query;
  const spreadSheetKey = id ? `${id}` : null;

  if (spreadSheetKey && !new RegExp(SPREADSHEET_KEY_RE).test(spreadSheetKey)) {
    return (
      <>
        <Nav />
        <DefaultErrorPage statusCode={404} />
      </>
    );
  }
  return spreadSheetKey ? (
    <GSheetsFlowMap
      spreadSheetKey={spreadSheetKey}
      flowsSheetKey={`${sheet ?? ''}`}
      embed={embed ? true : false}
    />
  ) : null;
};

export default FlowMapPage;
