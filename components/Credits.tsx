import {Away} from '../core';
import UnfoldedLogo from '../public/images/unfolded-logo.svg';
import TLLogo from '../public/images/TL-Horizontal-Black.svg';
import MapboxLogo from '../public/images/mapbox-logo-black.svg';
import Netlify from '../public/images/netlify-dark.svg';
import * as React from 'react';
import styled from '@emotion/styled';
import Image from 'next/image';
import Link from 'next/link';
import PoweredByImg from '../public/images/powered-by-FlowmapBlue-flat.svg';
import PoweredByMonoImg from '../public/images/powered-by-FlowmapBlue-mono-flat.svg';

export interface Props {
  showTitle?: boolean;
}

const Support = styled.p`
  margin-top: 1.5em;
  display: flex;
  justify-items: center;
  justify-content: center;
  flex-wrap: wrap;
  align-items: center;
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

const SupportLogo = ({
  name,
  src,
  href,
  width = 200,
  height = 25,
}: {
  name: string;
  src: string;
  href: string;
  width?: number;
  height?: number;
}) => (
  <SupportLogoLink href={href} target="_blank" rel="noopener noreferrer">
    <Image
      alt={`Supported by ${name}`}
      src={src}
      height={height}
      width={width}
      // placeholder="blur"
      // blurDataURL={src}
    />
  </SupportLogoLink>
);
const Credits: React.FC<Props> = (props) => {
  const {showTitle} = props;
  return (
    <>
      <section>
        {showTitle ? <h2>Credits</h2> : null}

        <p>
          Developed by <Away href="https://ilya.boyandin.me">Ilya Boyandin</Away> using {` `}
          <Away href="http://deck.gl">deck.gl</Away>,{` `}
          <Away href="https://github.com/teralytics/flowmap.gl">flowmap.gl</Away>,{` `}
          <Away href="https://github.com/mapbox/mapbox-gl-js">mapbox</Away>,{` `}
          <Away href="https://d3js.org/">d3</Away>,{` `}
          <Away href="https://blueprintjs.com/">blueprint</Away>,{` `}
          <Away href="https://github.com/CartoDB/cartocolor">CARTOColors</Away>.
        </p>
        <p>With kind support from</p>
        <Support>
          <SupportLogo name="Unfolded" href="https://www.unfolded.ai" src={UnfoldedLogo} />
          <SupportLogo name="Teralytics" href="https://www.teralytics.net" src={TLLogo} />
          <SupportLogo name="Mapbox" href="https://www.mapbox.com" src={MapboxLogo} />
          <SupportLogo
            width={100}
            height={55}
            name="Deploys by Netlify"
            href="https://www.netlify.com"
            src={Netlify}
          />
        </Support>
      </section>

      {/*<section>*/}
      {/*  <span*/}
      {/*    style={{*/}
      {/*      marginLeft: '1em',*/}
      {/*      zoom: 0.75,*/}
      {/*      filter: 'grayscale(0.8)contrast(0.75)',*/}
      {/*      opacity: 0.8,*/}
      {/*    }}*/}
      {/*  >*/}
      {/*    <Away href="https://www.producthunt.com/posts/flowmap-blue?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-flowmap-blue">*/}
      {/*      <img*/}
      {/*        src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=285959&theme=dark"*/}
      {/*        alt="FlowmapBlue - Flow map visualization for geographic movement analysis | Product Hunt"*/}
      {/*        style={{width: 250, height: 54}}*/}
      {/*        width="250"*/}
      {/*        height="54"*/}
      {/*      />*/}
      {/*    </Away>*/}
      {/*  </span>*/}
      {/*</section>*/}

      <section>
        <h2>Open Source</h2>
        <p>
          FlowmapBlue source code is free non-commercial usage. If you want to use it in a
          commercial project, please{' '}
          <a href="mailto:ilya@boyandin.me?subject=FlowmapBlue">reach out to us</a>.
        </p>
        <p>
          This work is licensed under a{' '}
          <Away href="http://creativecommons.org/licenses/by-nc/4.0/">
            Creative Commons Attribution-NonCommercial 4.0 International License
          </Away>
          .
        </p>
        <Away href="http://creativecommons.org/licenses/by-nc/4.0/">
          <Image width={88} height={31} alt="Creative Commons License" src="/images/cc-88x31.png" />
        </Away>
        <p>
          Please make sure to include proper attribution. Use one of these images and link them to
          the FlowmapBlue website:
          <br />
          <Link legacyBehavior href={PoweredByImg.src}>
            <a target="_blank">
              <Image width={150} height={50} title="Powered by FlowmapBlue" src={PoweredByImg} />
            </a>
          </Link>
          <Link legacyBehavior href={PoweredByMonoImg.src}>
            <a target="_blank">
              <Image
                width={150}
                height={50}
                title="Powered by FlowmapBlue"
                src={PoweredByMonoImg}
              />
            </a>
          </Link>
        </p>
      </section>

      <section>
        <h2 id="awards">Awards</h2>
        <Away href="https://www.informationisbeautifulawards.com/showcase/3815">
          <AwardImage
            alt="FlowmapBlue – Kantar Information is Beautiful Award"
            width={100}
            src="https://infobawards.s3.amazonaws.com/2019/badges/w-2019.png"
          />
        </Away>
      </section>
    </>
  );
};

export default Credits;
