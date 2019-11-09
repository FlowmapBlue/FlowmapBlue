import { Link } from 'react-router-dom';
import Away from './Away';
import * as React from 'react';
import styled from '@emotion/styled';
import { Colors } from '@blueprintjs/core';


const Outer = styled.div`
   display: flex;
   flex-direction: column;
   & > *+* { margin-top: 0.75rem; }
 `

const NewsDate = styled.div`
  color: ${Colors.GRAY3};
  font-size: small;
  min-width: 100px;
`

const NewsText = styled.div`
  display: block;
`

const NewsItem = styled.div`
  display: flex;
`



export default () =>
  <Outer>
    <NewsItem>
      <NewsDate>Nov 08, 2019</NewsDate>
      <NewsText>
        Added the <Link to="/od-matrix-converter">OD-matrix data converter</Link> data preparation helper tool.
      </NewsText>
    </NewsItem>
    <NewsItem>
      <NewsDate>Oct 28, 2019</NewsDate>
      <NewsText>
        Added the fade slider to manually adjust the brightness of the arrows for better map visibility.
      </NewsText>
    </NewsItem>
    <NewsItem>
      <NewsDate>Oct 26, 2019</NewsDate>
      <NewsText>
        The dark mode is now enabled by default. Changed the home page appearance.
      </NewsText>
    </NewsItem>
    <NewsItem>
      <NewsDate>Oct 16, 2019</NewsDate>
      <NewsText>
        Yay! Flowmap.blue <Away href="http://informationisbeautifulawards.com/showcase/3815-flowmap-blue">made it
        to the shortlist</Away> of
        the Information is Beautiful Awards.
      </NewsText>
    </NewsItem>
    <NewsItem>
      <NewsDate>Oct 13, 2019</NewsDate>
      <NewsText>
        Talk <Away href="https://ilya.boyandin.me/talks/2019-10-11-urban-mobility-symp/">"Scalability of OD-data
        visualizations"</Away> about
        flowmap.blue
        and <Away href="https://github.com/teralytics/flowmap.query">flowmap.query</Away> at
        the <Away href="https://www.citylab-berlin.org/events/mobilitysymposium_en/">Urban Mobility
        Symposium</Away> in Berlin.
      </NewsText>
    </NewsItem>
    <NewsItem>
      <NewsDate>Sep 15, 2019</NewsDate>
      <NewsText>
        Added color scheme and dark mode support.
      </NewsText>
    </NewsItem>
    <NewsItem>
      <NewsDate>Mar 26, 2019</NewsDate>
      <NewsText>
        Adding support for map styles.
      </NewsText>
    </NewsItem>
    <NewsItem>
      <NewsDate>Mar 24, 2019</NewsDate>
      <NewsText>
        Automatic clustering.
      </NewsText>
    </NewsItem>
    <NewsItem>
      <NewsDate>Mar 3, 2019</NewsDate>
      <NewsText>
        <Away href="https://ilya.boyandin.me/talks/2019-03-03-clisel/">Talk about flowmap.blue</Away> at
        the workshop
        on <Away href="https://clisel.eu/Ascona">Environmental Changes and Human Mobility</Away> in Ascona.
      </NewsText>
    </NewsItem>
    <NewsItem>
      <NewsDate>Feb 8, 2019</NewsDate>
      <NewsText>
        Added animation toggle.
      </NewsText>
    </NewsItem>
  </Outer>
