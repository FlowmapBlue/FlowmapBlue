import {Away} from '../core';
import * as React from 'react';
import Layout from '../core/Layout';
import Head from 'next/head';

export interface Props {}

const PrivacyPage: React.FC<Props> = (props) => {
  const {} = props;
  return (
    <Layout>
      <section>
        <h1>Privacy policy</h1>
        <Head>
          <title>Privacy – FlowmapBlue</title>
        </Head>
        <p>
          FlowmapBlue does not store any of the data the users upload to Google Sheets. The data
          from the spreadsheets is loaded directly into the clients&apos; browsers (using the{' '}
          <Away href="https://developers.google.com/chart/interactive/docs/querylanguage">
            Google Visualization API
          </Away>
          ). Refer to the{' '}
          <Away href="https://policies.google.com/privacy">Google Privacy Policy</Away> for details.
        </p>
        <p>
          We collect statistics on when the published maps are loaded. We treat the data as private,
          including the URLs of the spreadsheets and flow maps published by the users. We do not
          disclose the URLs without getting an explicit consent from the authors (unless the authors
          have already disclosed them by linking from a publicly accessible website). We may try to
          contact you asking for a permission to add your flow map to the list of examples on the
          homepage of FlowmapBlue.
        </p>
        <p>
          We track errors on the website via{' '}
          <Away href="https://sentry.io/trust/privacy/">Sentry</Away>. That is to know when
          FlowmapBlue fails, so that we can improve it.
        </p>
        <p>
          We use Mapbox for the background map. They are collecting some usage stats too. Please
          refer to <Away href="https://www.mapbox.com/legal/legal-faq">Mapbox Legal FAQ</Away> for
          details.
        </p>
      </section>
    </Layout>
  );
};

export default PrivacyPage;
