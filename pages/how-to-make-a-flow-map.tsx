import Layout from '../core/Layout';
import {Away} from '../core';
import ReadMore from '../components/ReadMore';
import Link from 'next/link';
import Head from 'next/head';

import SpreadsheetKeyExtractor from '../components/SpreadsheetKeyExtractor';
import * as React from 'react';
import styled from '@emotion/styled';

export interface Props {}

const ListOfSteps = styled.ol`
  margin: 30px 20px;
  & > li {
    margin: 1em 0;
    padding-left: 0.3em;
  }
  @media (max-width: 500px) {
    margin: 0;
    padding: 0;
    list-style-position: inside;
    & > li {
      padding-left: 0;
      margin-left: 0;
    }
  }
`;

const ListOfTools = styled.ul`
  list-style-type: none;
  padding: 0;
  h3 {
    margin-bottom: 0.5em;
  }
  & > * + * {
    margin-top: 2em;
  }
`;

const HowToPage: React.FC<Props> = (props) => {
  const {} = props;
  return (
    <Layout>
      <Head>
        <title>How to make a flow map – FlowmapBlue</title>
      </Head>
      <section>
        <h1>How to make a flow map</h1>
        <ReadMore isOpen>
          Consider using <Away href={'http://flowmap.city'}>Flowmap City</Away>, the new product we
          are building. It supports data uploads to a secure data storage, offers more analytics
          capabilities, improved scalability, an SQL query editor, and more coming.
        </ReadMore>
        <p>
          To visualize and publish a data set as a flow map you need to have a Google account.{' '}
          <Away href="https://accounts.google.com/signup">Sign up here</Away> if you don&apos;t.
        </p>
        <p>Follow these steps:</p>
        <ListOfSteps>
          <li>
            Open{' '}
            <Away href="https://docs.google.com/spreadsheets/d/1aEgwtGUGc0TdnsO0jIm50hshCZ-m4DHms3P0Qq9IYdA">
              the template spreadsheet
            </Away>{' '}
          </li>
          <li>Make a copy of it (find “File” / “Make a copy…” in the menu)</li>
          <li>
            Add data to the new spreadsheet.{' '}
            <ReadMore>
              <p>
                The spreadsheet has three sheets in it. They are named “<b>properties</b>”, “
                <b>locations</b>” and “<b>flows</b>”. The <b>properties</b> sheet has the title and
                the description for your data set and a few other configuration parameters. The{' '}
                <b>locations</b> sheet has the columns <b>id</b>, <b>lat</b>, <b>lon</b> and the
                optional <b>name</b>. The <b>flows</b> sheet has <b>origin</b>, <b>dest</b>,{' '}
                <b>count</b> and optional <b>time</b>. The values in the <b>origin</b> and{' '}
                <b>dest</b> columns must be the respective locations&apos; <b>id</b>s.
              </p>
              <p>
                Use the{' '}
                <Link legacyBehavior href="/od-matrix-converter">
                  OD-matrix converter
                </Link>{' '}
                if your movement counts are represented as an OD-matrix.
              </p>
              Our{' '}
              <Link legacyBehavior href="/geocoding">
                Geocoding tool
              </Link>{' '}
              can help you finding the geographic coordinates for locations if you only have their
              names in your dataset.
            </ReadMore>
          </li>
          {/*<li>Publish your spreadsheet by going to "File" / "Publish to the web…"</li>*/}
          <li>
            Click the “Share” button, then change the selection from “Restricted” to “Anyone with
            the link” in the drop-down under “Get link”.{' '}
            <ReadMore>
              This step is required so that FlowmapBlue can access the data in your spreadsheet. The
              spreadsheet and the flow map will be effectively private as long as you do not send
              their URLs to anyone and do not publish them online. We will treat your data as
              private by default and will not disclose the URLs without getting an explicit consent
              from you (unless you disclose them yourself first by linking from a publicly
              accessible website).
            </ReadMore>
          </li>
          <SpreadsheetKeyExtractor />
        </ListOfSteps>
        If you are not comfortable uploading your data to Google Sheets, consider using our{' '}
        <Link legacyBehavior href="/in-browser">
          In-browser flow map
        </Link>{' '}
        or load CSV files from any specific URLs as{' '}
        <Away href="https://github.com/FlowmapBlue/flowmap.blue/issues/18#issuecomment-610063627">
          described here
        </Away>
        .
      </section>

      <section>
        <h2 id="tools">Tools</h2>
        <p>These tools might help you preparing and visualizing your data:</p>

        <ListOfTools>
          <li>
            <h3>
              <Link legacyBehavior href="/geocoding">
                Geocoding tool
              </Link>
            </h3>
            <p>
              Can help you finding the geographic coordinates for locations if you only have their
              names in your dataset.
            </p>
          </li>
          <li>
            <h3>
              <Link legacyBehavior href="/od-matrix-converter">
                OD-matrix converter
              </Link>
            </h3>
            <p>Use it when your movement counts are represented as an OD-matrix.</p>
          </li>
          <li>
            <h3>
              <Link legacyBehavior href="/in-browser">
                In-browser flow map
              </Link>
            </h3>
            <p>
              With this tool you can visualize OD-data directly in your browser without having to
              upload the data to Google Sheets.
            </p>
          </li>
        </ListOfTools>
      </section>
      <section>
        <h2 id="need-help">Need help?</h2>
        <p>
          <Away href="https://spectrum.chat/flowmap-blue/general">Ask a question in the forum</Away>
          ,{` `}
          <Away href="https://github.com/FlowmapBlue/flowmap.blue/issues">submit an issue</Away>
          {` or `}
          <a href="mailto:ilya@boyandin.me?subject=FlowmapBlue">write me an email</a>.
        </p>
      </section>
    </Layout>
  );
};

export default HowToPage;
