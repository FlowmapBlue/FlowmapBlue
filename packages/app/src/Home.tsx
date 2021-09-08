import * as React from 'react';
import { Link } from 'react-router-dom';
import styled from '@emotion/styled';
import ReadMore from './ReadMore';
import SpreadsheetKeyExtractor from './SpreadsheetKeyExtractor';
import { Helmet } from 'react-helmet';
import MapboxLogo from './images/mapbox-logo-black.svg';
import LinuxFoundation from './images/linux-foundation-hztl-white.svg';
import NycCitiBikeImage from './images/nyc-citi-bike_1000px.jpg';
import TLLogo from './images/TL-Horizontal-Black.svg';
import { Button, Classes, Colors } from '@blueprintjs/core';
import Nav from './Nav';
import News from './News';
import ReactPlayer from 'react-player';
import { ListOfUses, ListOfUsesItem } from './Gallery';
import Logo from './Logo';
import { Column, Row } from './Boxes';
import Away from './Away';

const ContentBody = styled.div`
  padding: 10px 20px;
  @media (min-width: 500px) {
    padding: 20px 60px;
  }
  & h1 {
    font-size: 2rem;
  }
  margin: auto;
  max-width: 1500px;
`;

const LogoTitle = styled.h1`
  margin-bottom: 1em;
`;

const Support = styled.p`
  margin-top: 1.5em;
  display: flex;
  justify-items: center;
  flex-wrap: wrap;
`;

const AwardImage = styled.img`
  filter: grayscale(80%);
  transition: filter 0.5s;
  &:hover {
    filter: grayscale(20%);
  }
`;

const SupportLogoLink = styled.a`
  position: relative;
  margin-top: 20px;
  margin-right: 35px;
  //top: 0.14em;
  transition: opacity 0.2s;
  opacity: 0.6;
  //margin: 0 22px;
  img {
    max-width: 200px;
  }
  &:hover {
    opacity: 1;
  }
`;

const SupportLogo = ({ src, href }: { src: string; href: string }) => (
  <SupportLogoLink href={href} target="_blank" rel="noopener noreferrer">
    <img alt="support logo" src={src} height={22} />
  </SupportLogoLink>
);

const NoWrap = styled.span`
  display: flex;
  flex-wrap: nowrap;
`;

const DemoVideo = styled.div`
  width: 100%;
  margin-bottom: 20px;
  max-width: 500px;
  display: inline-block;
  @media (min-width: 800px) {
    float: right;
    margin-left: 20px;
  }
`;

const ResponsivePlayer = styled.div`
  position: relative;
  padding-top: 56.25%; /* Player ratio: 100 / (1280 / 720) */
`;

const ResponsiveReactPlayer = styled(ReactPlayer)`
  position: absolute;
  top: 0;
  left: 0;
  border: 1px solid ${Colors.GRAY1};
`;

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

const NewsletterDescription = styled.div`
  font-size: 9pt;
  color: ${Colors.GRAY4};
`;

const NewsletterOuter = styled.div`
  justify-self: flex-end;
  flex: 1;
  display: flex;
  justify-content: flex-end;
  button {
    white-space: nowrap;
  }
  input {
    width: 270px;
  }
  @media (max-width: 800px) {
    input {
      width: 200px;
    }
    margin-bottom: 2rem;
  }
`;

const TitleRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  align-items: center;
  @media (max-width: 800px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const Home = () => (
  <>
    <Nav />
    <ContentBody className={Classes.DARK}>
      <Helmet>
        <link href="https://flowmap.blue/" rel="canonical" />
        <title>Flowmap.blue - Flow map visualization tool</title>
      </Helmet>

      <TitleRow>
        <LogoTitle>
          <Logo fontSize={35} collapseWidth={300} />
        </LogoTitle>
        <NewsletterOuter>
          <form action="https://tinyletter.com/flowmap-blue" method="post" target="_blank">
            <Column spacing={10}>
              <Row spacing={10}>
                <input
                  className={Classes.INPUT}
                  type="text"
                  name="email"
                  id="tlemail"
                  placeholder="Enter your@email.address here"
                />
                <input type="hidden" defaultValue={1} name="embed" />
                <Button type="submit" text="Subscribe" />
              </Row>
              <NewsletterDescription>
                Subscribe to the newsletter to learn about{' '}
                <Away href="https://tinyletter.com/flowmap-blue/archive">
                  updates and new features
                </Away>
                .
              </NewsletterDescription>
            </Column>
          </form>
        </NewsletterOuter>
      </TitleRow>

      <DemoVideo>
        <ResponsivePlayer>
          <ResponsiveReactPlayer
            url={['/videos/demo_500.webm', '/videos/demo_500.mp4']}
            light={NycCitiBikeImage}
            width="100%"
            height="100%"
            controls={true}
            loop={true}
            playing={true}
          />
        </ResponsivePlayer>
      </DemoVideo>

      <section>
        <p>Create geographic flow maps representing your data published in Google Sheets.</p>
        <p>Visualize numbers of movements between locations (origin-destination data).</p>
        <p>Explore the data interactively.</p>
      </section>
      <section>
        <h2>What's it for?</h2>
        <div>
          Flowmap.blue is used to visualize various real-world phenomena in which pairs of locations
          are involved:
          <ListOfUses>
            <ListOfUsesItem>Urban mobility</ListOfUsesItem>
            <ListOfUsesItem>Commuters</ListOfUsesItem>
            <ListOfUsesItem>Pedestrian movement</ListOfUsesItem>
            <ListOfUsesItem>Bus travels </ListOfUsesItem>
            <ListOfUsesItem>Metro rides</ListOfUsesItem>
            <ListOfUsesItem>Train rides</ListOfUsesItem>
            <ListOfUsesItem>Air travels</ListOfUsesItem>
            <ListOfUsesItem>Marine traffic</ListOfUsesItem>
            <ListOfUsesItem>Bicycle sharing</ListOfUsesItem>
            <ListOfUsesItem>Scooter sharing</ListOfUsesItem>
            <ListOfUsesItem>Car ride sharing </ListOfUsesItem>
            <ListOfUsesItem>Taxi rides</ListOfUsesItem>
            <ListOfUsesItem>Internal migration</ListOfUsesItem>
            <ListOfUsesItem>International migration</ListOfUsesItem>
            <ListOfUsesItem>Refugees</ListOfUsesItem>
            <ListOfUsesItem>Human trafficking </ListOfUsesItem>
            <ListOfUsesItem>Drug flows </ListOfUsesItem>
            <ListOfUsesItem>Freight transportation </ListOfUsesItem>
            <ListOfUsesItem>Material flows</ListOfUsesItem>
            <ListOfUsesItem>Trade </ListOfUsesItem>
            <ListOfUsesItem>Bird migrations </ListOfUsesItem>
            <ListOfUsesItem>Livestock movements </ListOfUsesItem>
            <ListOfUsesItem>Plant migration</ListOfUsesItem>
            <ListOfUsesItem>Urban infrastructure</ListOfUsesItem>
            <ListOfUsesItem>Sewage flows</ListOfUsesItem>
            <ListOfUsesItem>Waste management</ListOfUsesItem>
            <ListOfUsesItem>Supply chain </ListOfUsesItem>
            <ListOfUsesItem>Epidemiology</ListOfUsesItem>
            <ListOfUsesItem>Historical journeys </ListOfUsesItem>
            <ListOfUsesItem>Scientific collaborations</ListOfUsesItem>
          </ListOfUses>
        </div>
        Many flow maps can be found in the <Link to="/gallery">examples gallery</Link>.
      </section>

      <section>
        {/*How to make a flow map*/}
        <h2 id="how-to">How to make a flow map</h2>
        <p>
          To visualize and publish a data set as a flow map you need to have a Google account.{' '}
          <Away href="https://accounts.google.com/signup">Sign up here</Away> if you don't.
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
                <b>dest</b> columns must be the respective locations' <b>id</b>s.
              </p>
              <p>
                Use the <Link to="/od-matrix-converter">OD-matrix converter</Link> if your movement
                counts are represented as an OD-matrix.
              </p>
              Our <Link to="/geocoding">Geocoding tool</Link> can help you finding the geographic
              coordinates for locations if you only have their names in your dataset.
            </ReadMore>
          </li>
          {/*<li>Publish your spreadsheet by going to "File" / "Publish to the web…"</li>*/}
          <li>
            Click the “Share” button, then change the selection from “Restricted” to “Anyone with
            the link” in the drop-down under “Get link”.{' '}
            <ReadMore>
              This step is required so that Flowmap.blue can access the data in your spreadsheet.
              The spreadsheet and the flow map will be effectively private as long as you don't send
              their URLs to anyone and don't publish them online. We'll treat your data as private
              by default and will not disclose the URLs without getting an explicit consent from you
              (unless you disclose them yourself first by linking from a publicly accessible
              website).
            </ReadMore>
          </li>
          <SpreadsheetKeyExtractor />
        </ListOfSteps>
        If you are not comfortable uploading your data to Google Sheets, consider using our{' '}
        <Link to="/in-browser">In-browser flow map</Link> or load CSV files from any specific URLs
        as{' '}
        <Away href="https://github.com/FlowmapBlue/flowmap.blue/issues/18#issuecomment-610063627">
          described here
        </Away>
        .
      </section>

      {/*<section>*/}
      {/*  <h2>Data preparation helpers</h2>*/}
      {/*  <p>*/}
      {/*    <Button>Convert OD-matrix</Button>*/}
      {/*  </p>*/}
      {/*</section>*/}

      <section>
        <h2 id="news">News</h2>
        <News />
      </section>

      <section>
        <h2 id="tools">Tools</h2>
        <p>
          Our <Link to="/geocoding">Geocoding tool</Link> can help you finding the geographic
          coordinates for locations if you only have their names in your dataset.
        </p>
        <p>
          Use the <Link to="/od-matrix-converter">OD-matrix converter</Link> if your movement counts
          are represented as an OD-matrix.
        </p>
        <p>
          With the <Link to="/in-browser">In-browser flow map</Link> you can visualize OD-data{' '}
          <b>directly in your browser</b> without having to upload the data to Google Sheets.
        </p>
      </section>

      <section>
        <h2 id="need-help">Need help?</h2>
        <p>
          <Away href="https://spectrum.chat/flowmap-blue/general">Ask a question in the forum</Away>
          ,{` `}
          <Away href="https://github.com/FlowmapBlue/flowmap.blue/issues">submit an issue</Away>
          {` or `}
          <a href="mailto:ilya@boyandin.me?subject=Flowmap.blue">write me an email</a>.
        </p>
      </section>
      <section>
        <h2 id="privacy">Data privacy</h2>
        <p>
          Flowmap.blue does not store any of the data the users upload to Google Sheets. The data
          from the spreadsheets is loaded directly into the clients' browsers. We are using{' '}
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
          Google Analytics involves setting cookies in the users' browsers for detecting recurring
          visits and working sessions.
        </p>
        <p>
          We may try to contact you asking for a permission to add your flow map to the list of
          examples on the homepage of Flowmap.blue.
        </p>
      </section>
      <section>
        <h2 id="open-source">Open source</h2>
        <p>
          {`The source code of Flowmap.blue `}
          <Away href="https://github.com/FlowmapBlue/flowmap.blue">is freely available</Away>
          {` under the  `}
          <Away href="https://github.com/FlowmapBlue/flowmap.blue/blob/master/LICENSE">
            MIT license
          </Away>
          .
        </p>
        <p>
          Make sure to include a proper attribution (URL of Flowmap.blue, the original author) if
          you use it in a different project.
        </p>
      </section>
      <section>
        <h2 id="credits">Credits</h2>
        <p>
          Developed by <Away href="https://ilya.boyandin.me">Ilya Boyandin</Away> using {` `}
          <Away href="https://github.com/teralytics/flowmap.gl">flowmap.gl</Away>,{` `}
          <Away href="http://deck.gl">deck.gl</Away>,{` `}
          <Away href="https://github.com/mapbox/mapbox-gl-js">mapbox</Away>,{` `}
          <Away href="https://d3js.org/">d3</Away>,{` `}
          <Away href="https://blueprintjs.com/">blueprint</Away>,{` `}
          <Away href="https://github.com/CartoDB/cartocolor">CARTOColors</Away>.
        </p>
        <p>With kind support from</p>
        <Support>
          <SupportLogo href="https://www.teralytics.net" src={TLLogo} />
          <SupportLogo href="https://www.linuxfoundation.org" src={LinuxFoundation} />
          <SupportLogo href="https://www.mapbox.com" src={MapboxLogo} />
        </Support>
      </section>
      <section>
        <span style={{ zoom: 0.8 }}>
          <Away href="https://www.netlify.com">
            <img
              width={114}
              height={51}
              src="https://www.netlify.com/img/global/badges/netlify-dark.svg"
              alt="Deploys by Netlify"
            />
          </Away>
        </span>
        <span
          style={{
            marginLeft: '1em',
            zoom: 0.75,
            filter: 'grayscale(0.8)contrast(0.75)',
            opacity: 0.8,
          }}
        >
          <Away href="https://www.producthunt.com/posts/flowmap-blue?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-flowmap-blue">
            <img
              src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=285959&theme=dark"
              alt="Flowmap.blue - Flow map visualization for geographic movement analysis | Product Hunt"
              style={{ width: 250, height: 54 }}
              width="250"
              height="54"
            />
          </Away>
        </span>
      </section>
      <section>
        <h2 id="awards">Awards</h2>
        <Away href="https://www.informationisbeautifulawards.com/showcase/3815">
          <AwardImage
            width={100}
            src="https://infobawards.s3.amazonaws.com/2019/badges/w-2019.png"
          />
        </Away>
      </section>
    </ContentBody>
  </>
);

export default Home;
