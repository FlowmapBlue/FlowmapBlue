import {Away} from '../core';
import * as React from 'react';
import Layout from '../core/Layout';
import Head from 'next/head';
import Credits from '../components/Credits';

export interface Props {}

const CreditsPage: React.FC<Props> = (props) => {
  const {} = props;
  return (
    <Layout>
      <section>
        <h1>Credits</h1>
        <Head>
          <title>Credits – Flowmap.blue</title>
        </Head>
        <Credits />
      </section>
    </Layout>
  );
};

export default CreditsPage;
