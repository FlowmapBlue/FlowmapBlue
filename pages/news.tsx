import React from 'react';
import Layout from '../core/Layout';
import News from '../components/News';
import Head from 'next/head';

export interface Props {}

const NewsPage: React.FC<Props> = (props) => {
  const {} = props;
  return (
    <Layout>
      <section>
        <h1>News</h1>
        <Head>
          <title>News – Flowmap.blue</title>
        </Head>
        <News />
      </section>
    </Layout>
  );
};

export default NewsPage;
