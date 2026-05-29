import React from 'react';
import Layout from '../core/Layout';
import News from '../components/News';
import Seo from '../components/Seo';

export interface Props {}

const NewsPage: React.FC<Props> = (props) => {
  const {} = props;
  return (
    <Layout>
      <section>
        <h1>News</h1>
        <Seo title="News – FlowmapBlue" path="/news" />
        <News />
      </section>
    </Layout>
  );
};

export default NewsPage;
