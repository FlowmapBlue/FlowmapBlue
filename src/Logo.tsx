import { ColorScheme } from './colors';
import { Link } from 'react-router-dom';
import * as React from 'react';
import logo from './images/logo.svg';
import styled from '@emotion/styled';
import { Row } from './Boxes';

type Props = {
  embed?: boolean
  fontSize?: number,
  collapseWidth?: number,
}


type LogoImageProps = { size: number };
const LogoImage = styled.img<LogoImageProps>(({ size }: LogoImageProps) => `
  width: ${size}px;
  height: ${size}px;
`)

const SHADOW_COLOR = ColorScheme.primary
const LogoText = styled.div<Props>((
  { fontSize, collapseWidth }: Props
) => ({
  // fontFamily: "'Titillium Web', sans-serif",
  fontSize,
  color: '#fff',
  fontWeight: 'bold',
  textShadow:
    `1px -1px 1px ${SHADOW_COLOR}, 
    1px 1px 1px ${SHADOW_COLOR}, 
    -1px -1px 1px ${SHADOW_COLOR}, 
    -1px 1px 1px ${SHADOW_COLOR}`,
  [`@media (max-width: ${collapseWidth}px)`]: {
    display: 'none',
  },
}))

const Logo = (
  {
    fontSize = 25,
    collapseWidth = 525,
    embed,
  }: Props) => {
  return (
    <Link
      to="/"
      style={{ textDecoration: 'none' }}
      target={embed ? '_blank' : undefined}
      rel="noopener noreferrer"
    >
      <Row spacing={fontSize / 5}>
        <LogoImage
          size={fontSize * 1.5}
          alt="flowmap.blue logo"
          src={logo}
        />
        <LogoText
          collapseWidth={collapseWidth}
          fontSize={fontSize}
        >
          flowmap.blue
        </LogoText>
      </Row>
    </Link>
  )
}


export default Logo
