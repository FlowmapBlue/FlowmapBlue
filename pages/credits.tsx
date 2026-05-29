import {Away} from '../core';
import * as React from 'react';
import Layout from '../core/Layout';
import Credits from '../components/Credits';
import Seo from '../components/Seo';

export interface Props {}

const CreditsPage: React.FC<Props> = (props) => {
  const {} = props;
  return (
    <Layout>
      <section>
        <h1>Credits</h1>
        <Seo title="Credits – FlowmapBlue" path="/credits" />
        <Credits />
      </section>
    </Layout>
  );
};

export default CreditsPage;
