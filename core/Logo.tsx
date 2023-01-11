import {ColorScheme, opacifyHex} from './colors';
import Link from 'next/link';
import * as React from 'react';
import styled from '@emotion/styled';
import {Row} from './Boxes';
import Image from 'next/image';
import Away from './Away';

type Props = {
  embed?: boolean;
  showText?: boolean;
  fontSize?: number;
  collapseWidth?: number;
};

const SHADOW_COLOR = ColorScheme.primary;

function makeTextShadow(color: string) {
  return `1px -1px 1px ${color}, 
    1px 1px 1px ${color}, 
    -1px -1px 1px ${color}, 
    -1px 1px 1px ${color}`;
}

const LogoText = styled.div<Props>(({fontSize, collapseWidth}: Props) => ({
  // fontFamily: "'Titillium Web', sans-serif",
  fontSize,
  color: '#fff',
  fontWeight: 'bold',

  textShadow: makeTextShadow(SHADOW_COLOR),
  [`@media (max-width: ${collapseWidth}px)`]: {
    display: 'none',
  },
}));

const Logo = ({fontSize = 25, collapseWidth = 525, embed, showText = true}: Props) => {
  const size = Math.ceil(fontSize * 1.5);
  const content = (
    <Row spacing={fontSize / 5}>
      <svg width={size} height={size} viewBox="-20 -20 432 432">
        <g transform="translate(1 1)" stroke="none" strokeWidth={1} fill="none" fillRule="evenodd">
          <circle stroke="#979797" fill="#1A70A7" cx={200} cy={200} r={200} />
          <path
            d="M265.5 199.045h42.545L216.5 320.411V84.5h49v114.545zM135.5 202.955H92.955L184.5 81.589V317.5h-49V202.955z"
            strokeOpacity={0.937273551}
            stroke="#FFF"
            strokeWidth={13}
            strokeLinejoin="round"
          />
        </g>
      </svg>
      {showText ? (
        <LogoText collapseWidth={collapseWidth} fontSize={fontSize}>
          <div style={{display: 'flex'}}>
            <span>Flowmap</span>
            <span>Blue</span>
          </div>
        </LogoText>
      ) : null}
    </Row>
  );
  if (embed) {
    return (
      <a
        href="https://flowmap.blue"
        style={{textDecoration: 'none'}}
        target="_blank"
        rel="noopener noreferrer"
      >
        {content}
      </a>
    );
  }
  return (
    <Link href="/">
      <div style={{textDecoration: 'none', cursor: 'pointer'}}>{content}</div>
    </Link>
  );
};

export default Logo;
