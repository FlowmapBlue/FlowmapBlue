import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styled from '@emotion/styled';
import { Away, Column, Logo, Row } from '../core';
import MapboxLogo from '../public/images/mapbox-logo-black.svg';
import LinuxFoundation from '../public/images/linux-foundation-hztl-white.svg';
import VideoPlaceholderImg from '../public/images/nyc-citi-bike_1000px.jpg';
import TLLogo from '../public/images/TL-Horizontal-Black.svg';
import UcfLogo from '../public/images/ucf-logo.svg';
import { Button, Classes, Colors } from '@blueprintjs/core';
import News from '../components/News';
import ReactPlayer from 'react-player';
import { ListOfUses, ListOfUsesItem } from './gallery';
import Layout from '../core/Layout';
import { USED_BY_LOGOS } from '../used-by';

const LogoTitle = styled.h1`
  margin-bottom: 1em;
`;

const Support = styled.p`
  margin-top: 1.5em;
  display: flex;
  justify-items: center;
  justify-content: center;
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
  margin-bottom: 20px;
  //top: 0.14em;
  transition: opacity 0.2s;
  opacity: 0.6;
  //margin: 0 22px;
  &:hover {
    opacity: 1;
  }
`;

const SupportLogo = ({ name, src, href }: { name: string; src: string; href: string }) => (
  <SupportLogoLink href={href} target="_blank" rel="noopener noreferrer">
    <Image alt={`Supported by ${name}`} src={src} height={25} width={200} />
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

const UsedByContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-items: center;
  justify-content: center;
  & > * > img {
    max-width: 100px;
    height: 50px;
  }
  & > * {
    padding: 1em;
    opacity: 0.5;
    transition: opacity 0.2s;
    &:hover {
      opacity: 1;
    }
  }
  padding: 1em;
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

const Index = () => (
  <Layout>
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
          light={VideoPlaceholderImg.src}
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
      <h2>What is it for?</h2>
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
      <Link href="/gallery">Visit our gallery</Link> to see real world examples.
    </section>

    <section>
      <h2>Who is using it?</h2>
      <UsedByContainer>
        {USED_BY_LOGOS.map(({ url, name, img, width = 120 }) => (
          <Away key={name} href={url}>
            <Image alt={name} width={width} height="50" src={img} objectFit="contain" />
          </Away>
        ))}
      </UsedByContainer>
    </section>

    <section>
      {/*How to make a flow map*/}
      <h2 id="how-to">How to make a flow map?</h2>
      <p>
        Follow the steps <Link href="/how-to-make-a-flow-map">described on this page</Link>.
      </p>
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
        Make sure to include a proper attribution (URL of Flowmap.blue, the original author) if you
        use it in a different project.
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
        <SupportLogo name="Teralytics" href="https://www.teralytics.net" src={TLLogo} />
        <SupportLogo name="Mapbox" href="https://www.mapbox.com" src={MapboxLogo} />
        <SupportLogo name="Urban Computing Foundation" href="https://uc.foundation" src={UcfLogo} />
        <SupportLogo
          name="Linux Foundation"
          href="https://www.linuxfoundation.org"
          src={LinuxFoundation}
        />
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
          alt="Flowmap.blue – Kantar Information is Beautiful Award"
          width={100}
          src="https://infobawards.s3.amazonaws.com/2019/badges/w-2019.png"
        />
      </Away>
    </section>
  </Layout>
);

export default Index;
