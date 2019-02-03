import * as React from 'react'
import { Link } from 'react-router-dom'
import Logo from './Logo'
import MapboxLogo from './images/mapbox-logo-black.svg'
import TLLogo from './images/TL-Horizontal-Black.svg'
import styled from '@emotion/styled';
import ReadMore from './ReadMore';

const examples = [
  { key: '1Z6dVVFFrdooHIs8xnJ_O7eM5bhS5KscCi7G_k0jUNDI', name: 'London bicycle hires in 2017' },
  { key: '1Aum0anWxPx6bHyfcFXWCCTE8u0xtfenIls_kPAJEDIA', name: '17 million New York Citi Bike trips in 2018' },
  { key: '1Oe3zM219uSfJ3sjdRT90SAK2kU3xIvzdcCW6cwTsAuc', name: 'Commuters in the Netherlands in 2016' },
  { key: '1fhX98NFv5gAkkjB2YFCm50-fplFpmWVAZby3dmm9cgQ', name: 'Chicago taxis' },
  { key: '1aEgwtGUGc0TdnsO0jIm50hshCZ-m4DHms3P0Qq9IYdA', name: 'Template for publishing' },
]

const Outer = styled.div`
  padding: 10px 20px;
  & h1 { font-size: 2rem; }
  & li { margin: 0.5em 0; }
`


const Support = styled.p`
  display: flex;
  justify-items: center;
  flex-wrap: wrap;
  & > *+* {
    margin-left: .5em; 
  }
`

const SupportLogoLink = styled.a`
  position: relative;
  top: 2px;
  opacity: 1;
  transition: opacity 0.2s;
  &:hover {
    opacity: 0.6;
  }
`

const SupportLogo = ({ src, href }: { src: string, href: string }) =>
  <SupportLogoLink href={href} target="_blank" rel="noopener">
    <img src={src} height={22} />
  </SupportLogoLink>




const Intro = () =>
  <Outer>
    <section className="intro">
      <h1><Logo fontSize={35} /></h1>

      <section>
        <p>
          This app can render a geographic flow map visualization
          from a spreadsheet published on
          {` `}<a href="https://docs.google.com/spreadsheets/" target="_blank" rel="noopener">Google Sheets</a>.
        </p>
        <p>
          It can be used to visualize numbers of movements of people or goods
          between pairs of geographic locations (Origin-Destination data).
        </p>
      </section>

      <section>
        <h2>Examples</h2>
        <ul>
          {
            examples.map(({ key, name }) =>
              <li key={key}>
                <Link to={`/${key}`}>{name}</Link>
                {` `}
                (<a
                  href={`https://docs.google.com/spreadsheets/d/${key}`}
                  target="_blank" rel="noopener"
                >spreadsheet</a>)
              </li>
            )
          }
        </ul>
      </section>

      <section>
        <h2>Publish your own dataset</h2>
        <p>
          To publish your own dataset with the app you need to have a Google account.{' '}
          <a href="https://accounts.google.com/signup" target="_blank" rel="noopener">Sign up here</a> if you don't have one yet.
        </p>
        <p>
          Once you have one, follow these steps:
        </p>
        <ol>
          <li>Open <a href="https://docs.google.com/spreadsheets/d/1aEgwtGUGc0TdnsO0jIm50hshCZ-m4DHms3P0Qq9IYdA" target="_blank" rel="noopener">this spreadsheet</a> and
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
          <li>Copy the key of your spreadsheet from its URL. It comes right after docs.google.com/spreadsheets/d/</li>
          <li>Open{` `}
            <a href="http://flowmap.blue/YOUR_SPREADSHEET_KEY" target="_blank" rel="noopener">
              flowmap.blue/YOUR_SPREADSHEET_KEY
            </a>
          </li>
          <li><a href="https://spectrum.chat/flowmap-blue/published-flow-maps" target="_blank" rel="noopener">Share it with others</a>
          </li>
        </ol>
      </section>
      <section>
        <h2>Need help?</h2>
        <p>
          <a href="https://spectrum.chat/flowmap-blue/general" target="_blank" rel="noopener">Ask a question</a>{`, `}
          <a href="https://github.com/ilyabo/flowmap.blue/issues" target="_blank" rel="noopener">submit an issue</a>{` or `}
          <a href="mailto:ilya@boyandin.me?subject=flowmap.blue">write me an email</a>.
        </p>
      </section>
      <section>
        <h2>Credits</h2>
        <p>
          Developed by <a href="https://ilya.boyandin.me" target="_blank" rel="noopener">Ilya Boyandin</a> using {` `}
          <a href="https://github.com/teralytics/flowmap.gl" target="_blank" rel="noopener">flowmap.gl</a>,{` `}
          <a href="http://deck.gl" target="_blank" rel="noopener">deck.gl</a>,{` `}
          <a href="https://github.com/mapbox/mapbox-gl-js" target="_blank" rel="noopener">mapbox</a>,{` `}
          <a href="https://d3js.org/" target="_blank" rel="noopener">d3</a>.
        </p>
        <Support>
          <span>With kind support from</span>
          <SupportLogo href="https://www.teralytics.net" src={TLLogo}/>
          <span>and</span>
          <SupportLogo href="https://www.mapbox.com" src={MapboxLogo}/>
        </Support>
      </section>
    </section>

    <a href="https://github.com/ilyabo/flowmap.blue">
      <img
        style={{
          position: 'absolute', top: 0, right: 0, border: 0,
        }}
        src="https://s3.amazonaws.com/github/ribbons/forkme_right_gray_6d6d6d.png"
        alt="Fork me on GitHub" />
    </a>
  </Outer>



export default Intro
