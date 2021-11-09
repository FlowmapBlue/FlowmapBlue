import React from 'react';
import Layout from '../core/Layout';
import News from '../components/News';

export interface Props {}

const NewsPage: React.FC<Props> = (props) => {
  const {} = props;
  return (
    <Layout>
      <section>
        <h2>News</h2>
        <News />
      </section>
    </Layout>
  );
};

export default NewsPage;
