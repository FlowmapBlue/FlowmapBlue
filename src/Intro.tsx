import * as React from 'react'
import { Link } from 'react-router-dom'
import Logo from './Logo'
import MapboxLogo from './images/mapbox-logo-black.svg'
import TLLogo from './images/TL-Horizontal-Black.svg'
import ExampleFlowmapImage from './images/swiss-cantons-relocations.jpg'
import styled from '@emotion/styled';
import ReadMore from './ReadMore';
import examples from './examples.json';
import SpreadsheetKeyExtractor from './SpreadsheetKeyExtractor';
import Away from './Away';

const Outer = styled.div`
  padding: 10px 20px;
  & h1 { font-size: 2rem; }
  & li { margin: 0.5em 0; }
`


const Support = styled.p`
  display: flex;
  justify-items: center;
  flex-wrap: wrap;
`

const SupportLogoLink = styled.a`
  position: relative;
  top: 0.25em;
  transition: opacity 0.2s;
  opacity: 0.6;
  margin: 0 22px;
  &:hover {
    opacity: 1;
  }
`

const SupportLogo = ({ src, href }: { src: string, href: string }) =>
  <SupportLogoLink href={href} target="_blank" rel="noopener noreferrer">
    <img src={src} height={22} />
  </SupportLogoLink>

const NoWrap = styled.span`
  display: flex;
  flex-wrap: nowrap;
`

const Intro = () =>
  <Outer>
    <section className="intro">
      <h1><Logo fontSize={35} collapseWidth={300} /></h1>

      <section>
        <p>
          This app can render a geographic flow map visualization
          from a spreadsheet published on
          {` `}<Away href="https://docs.google.com/spreadsheets/">Google Sheets</Away>.
        </p>
        <p>
          It can be used to visualize numbers of movements of people or goods
          between pairs of geographic locations (Origin-Destination data).
        </p>
        <Away href="/16wFY54ZbrZuZQoOCvpU2fAzlxB7MKLNspqKBOWrp1J8">
          <img
            src={ExampleFlowmapImage}
            alt={"Example flow map"}
            width="100%"
            style={{ maxWidth: 500 }}
          />
        </Away>
      </section>


      <section>
        <h2>Examples</h2>
        <ul>
          {
            examples.map(({ key, name }) =>
              <li key={key}>
                <Link to={`/${key}`}>{name}</Link>
                {` `}
                (<Away href={`https://docs.google.com/spreadsheets/d/${key}`}>spreadsheet</Away>)
              </li>
            )
          }
        </ul>
      </section>

      <section>
        <h2>Publish your own dataset</h2>
        <p>
          To publish your own dataset with the app you need to have a Google account.{' '}
          <Away href="https://accounts.google.com/signup">Sign up here</Away> if you don't have one yet.
        </p>
        <p>
          Once you have one, follow these steps:
        </p>
        <ol>
          <li>Open <Away href="https://docs.google.com/spreadsheets/d/1aEgwtGUGc0TdnsO0jIm50hshCZ-m4DHms3P0Qq9IYdA">this spreadsheet</Away> and
            make a copy of it (File / Make a copy…)</li>
          <li>Add data to the new spreadsheet. <ReadMore>
              The spreadsheet has three sheets in it.
              They are named "<b>properties</b>", "<b>locations</b>" and "<b>flows</b>".
              The <b>properties</b> sheet has the title and the description for your dataset and a few other configuration parameters.
              The <b>locations</b> sheet has the columns <b>id</b>, <b>lat</b>, <b>lon</b> and the optional <b>name</b>.
              The <b>flows</b> sheet has <b>origin</b>, <b>dest</b> and <b>count</b>.
              The values in the <b>origin</b> and <b>dest</b> columns must be the respective locations' <b>id</b>s.
            </ReadMore>
          </li>
          {/*<li>Publish your spreadsheet by going to "File" / "Publish to the web…"</li>*/}
          <li>Share the spreadsheet by going to "File" / "Share with others", clicking "Advanced", and then
            choosing "Anyone with the link can view".
            </li>
          <SpreadsheetKeyExtractor />
        </ol>
      </section>
      <section>
        <h2>Need help?</h2>
        <p>
          <Away href="https://spectrum.chat/flowmap-blue/general">Ask a question in the forum</Away>,{` `}
          <Away href="https://github.com/ilyabo/flowmap.blue/issues">submit an issue</Away>
          {` or `}
          <a href="mailto:ilya@boyandin.me?subject=flowmap.blue">write me an email</a>.
        </p>
      </section>
      <section>
        <h2>Privacy notice</h2>
        <p>
          flowmap.blue does not store any of the data the users upload to Google Sheets.
        </p>
        <p>
          To make sure that flowmap.blue can be constantly improved
          we collect anonymous usage statistics via Google Analytics and track errors via Sentry.
        </p>
        <p>
          We will not share the URLs of your flow maps and spreadsheets with any other third parties
          without your explicit consent.
        </p>
      </section>
      <section>
        <h2>Open source</h2>
        <p>
          {`The source code of flowmap.blue `}
          <Away href="https://github.com/ilyabo/flowmap.blue">is freely available</Away>
          {` under the  `}
          <Away href="https://github.com/ilyabo/flowmap.blue/blob/master/LICENSE">MIT license</Away>.
        </p>
        <p>
          Make sure to include a proper attribution (URL of flowmap.blue, the original author) if you use it in a different project.
        </p>
      </section>
      <section>
        <h2>Credits</h2>
        <p>
          Developed by <Away href="https://ilya.boyandin.me">Ilya Boyandin</Away> using {` `}
          <Away href="https://github.com/teralytics/flowmap.gl">flowmap.gl</Away>,{` `}
          <Away href="http://deck.gl">deck.gl</Away>,{` `}
          <Away href="https://github.com/mapbox/mapbox-gl-js">mapbox</Away>,{` `}
          <Away href="https://d3js.org/">d3</Away>.
        </p>
        <Support>
          <span>With kind support from</span>
          <NoWrap>
            <SupportLogo href="https://www.teralytics.net" src={TLLogo}/>
            <span>and</span>
            <SupportLogo href="https://www.mapbox.com" src={MapboxLogo}/>
          </NoWrap>
        </Support>
      </section>
    </section>
  </Outer>



export default Intro
