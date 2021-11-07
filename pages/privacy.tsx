import { Away } from '../core';
import * as React from 'react';
import Layout from '../core/Layout';

export interface Props {}

const PrivacyPage: React.FC<Props> = (props) => {
  const {} = props;
  return (
    <Layout>
      <section>
        <h2 id="privacy">Privacy policy</h2>
        <p>
          Flowmap.blue does not store any of the data the users upload to Google Sheets. The data
          from the spreadsheets is loaded directly into the clients&apos; browsers. We are using{' '}
          <Away href="https://developers.google.com/chart/interactive/docs/querylanguage">
            Google Visualization API
          </Away>{' '}
          for that.
        </p>
        <p>
          We treat the data as private, including the URLs of the spreadsheets and flow maps
          published by the users. We do not disclose the URLs without getting an explicit consent
          from the authors (unless the authors have already disclosed them by linking from a
          publicly accessible website).
        </p>
        <p>
          We collect usage statistics via Google Analytics and track errors via Sentry. We want to
          know how Flowmap.blue is used and when it fails so that we can improve it. The use of
          Google Analytics involves setting cookies in the users&apos; browsers for detecting
          recurring visits and working sessions.
        </p>
        <p>
          We may try to contact you asking for a permission to add your flow map to the list of
          examples on the homepage of Flowmap.blue.
        </p>
      </section>
    </Layout>
  );
};

export default PrivacyPage;
