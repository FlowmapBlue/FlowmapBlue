import {Away} from '../core';
import TLLogo from '../public/images/TL-Horizontal-Black.svg';
import MapboxLogo from '../public/images/mapbox-logo-black.svg';
import UcfLogo from '../public/images/ucf-logo.svg';
import LinuxFoundation from '../public/images/linux-foundation-hztl-white.svg';
import * as React from 'react';
import styled from '@emotion/styled';
import Image from 'next/image';

export interface Props {}

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

const SupportLogo = ({name, src, href}: {name: string; src: string; href: string}) => (
  <SupportLogoLink href={href} target="_blank" rel="noopener noreferrer">
    <Image
      alt={`Supported by ${name}`}
      src={src}
      height={25}
      width={200}
      placeholder="blur"
      blurDataURL={src}
    />
  </SupportLogoLink>
);
const Credits: React.FC<Props> = (props) => {
  const {} = props;
  return (
    <>
      <section>
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
          <SupportLogo
            name="Urban Computing Foundation"
            href="https://uc.foundation"
            src={UcfLogo}
          />
          <SupportLogo
            name="Linux Foundation"
            href="https://www.linuxfoundation.org"
            src={LinuxFoundation}
          />
        </Support>
      </section>

      <section>
        <span style={{zoom: 0.8}}>
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
              style={{width: 250, height: 54}}
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
    </>
  );
};

export default Credits;
