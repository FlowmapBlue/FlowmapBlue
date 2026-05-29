import * as React from 'react';
import {useRouter} from 'next/router';
import type {GetServerSideProps, GetServerSidePropsContext} from 'next';
import {FLOWS_SHEET_KEY_RE, SPREADSHEET_KEY_RE} from '../components/constants';
import DefaultErrorPage from 'next/error';
import Nav from '../components/Nav';
import examplesConfig from '../examples.json';

import GSheetsFlowMap from '../components/GSheetsFlowMap';

type Example = {
  key: string;
  sheet?: string;
  name: string;
};

const examples = examplesConfig.examples as Example[];

export interface Props {
  embed?: boolean;
  spreadSheetKey?: string;
  flowsSheetKey?: string;
  title?: string;
}

const FlowMapPage: React.FC<Props> = (props) => {
  const {embed, title} = props;
  const router = useRouter();
  const {id, sheet} = router.query;
  const spreadSheetKey = props.spreadSheetKey ?? (id ? `${id}` : null);
  const flowsSheetKey = props.flowsSheetKey ?? `${sheet ?? ''}`;

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
      flowsSheetKey={flowsSheetKey}
      embed={embed ? true : false}
      initialTitle={title}
    />
  ) : null;
};

export const getFlowMapServerSideProps =
  (embed = false): GetServerSideProps<Props> =>
  async ({params}: GetServerSidePropsContext) => {
    const id = typeof params?.id === 'string' ? params.id : '';
    const sheet = typeof params?.sheet === 'string' ? params.sheet : '';

    if (!new RegExp(`^${SPREADSHEET_KEY_RE}$`).test(id)) {
      return {notFound: true};
    }

    if (sheet && !new RegExp(`^${FLOWS_SHEET_KEY_RE}$`).test(sheet)) {
      return {notFound: true};
    }

    const example = examples.find(
      (example) => example.key === id && (example.sheet ?? '') === sheet,
    );

    return {
      props: {
        embed,
        spreadSheetKey: id,
        flowsSheetKey: sheet,
        title: example?.name,
      },
    };
  };

export const getServerSideProps = getFlowMapServerSideProps(false);

export default FlowMapPage;
