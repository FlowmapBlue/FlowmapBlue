import * as React from 'react';
import { useEffect, useState } from 'react';
import GSheetsFlowMap from '../components/GSheetsFlowMap';
import { useRouter } from 'next/router';
import { SPREADSHEET_KEY_RE } from '../components/constants';
import DefaultErrorPage from 'next/error';
import Nav from '../components/Nav';

export interface Props {}

const FlowMapPage: React.FC<Props> = (props) => {
  const router = useRouter();
  const { id, sheet } = router.query;

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    (async () => {
      setMounted(true);
    })();
  }, []);

  if (!new RegExp(SPREADSHEET_KEY_RE).test(`${id}`)) {
    return (
      <>
        <Nav />
        <DefaultErrorPage statusCode={404} />
      </>
    );
  }
  return mounted ? (
    // only render in browser
    <GSheetsFlowMap spreadSheetKey={`${id ?? ''}`} flowsSheetKey={`${sheet ?? ''}`} embed={false} />
  ) : null;
};

export default FlowMapPage;
