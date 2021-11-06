import React, { ReactNode } from 'react';
import { Alignment, Classes, Navbar } from '@blueprintjs/core';
import { Away } from '../core';
import GitHubLogo from '../public/images/github.svg';
import SpectrumLogo from '../public/images/spectrum.svg';
import styled from '@emotion/styled';
import Link from 'next/link';
import Image from 'next/image';

const NavBar = styled(Navbar)`
  background-color: ${'rgb(38, 50, 71)'} !important;
`;

const NavMenu = styled(Navbar.Group)`
  white-space: nowrap;
  font-weight: 400;
  @media (max-width: 850px) {
    display: none;
  }
`;

const LinksArea = styled.div`
  display: flex;
  float: right;
  align-items: center;
  & > * + * {
    margin-left: 20px;
  }
  @media (max-width: 1070px) {
    // display: none;
  }
`;

const LinkItem = styled.div`
  display: flex;
  align-items: center;
  span {
    text-transform: uppercase;
    font-size: 12px;
    margin-right: 5px;
  }
  img {
    width: 20px;
  }
`;

const NavItem = ({ to, children }: { to: string; children: ReactNode }) => (
  <Link
    // activeClassName={Classes.ACTIVE}
    // isActive={(match, location) => {
    //   if (!match) {
    //     return false;
    //   }
    //   if (!location.hash && to.indexOf('#') > 0) {
    //     return false;
    //   }
    //   if (location.hash && !to.endsWith(location.hash)) {
    //     return false;
    //   }
    //   return true;
    // }}
    href={to}
  >
    <div
      className={[Classes.INTENT_PRIMARY, Classes.BUTTON, Classes.MINIMAL, Classes.LARGE].join(' ')}
    >
      {children}
    </div>
  </Link>
);

const Nav = () => (
  <NavBar className={Classes.DARK} fixedToTop={false}>
    <NavMenu align={Alignment.LEFT}>
      {/*<Navbar.Heading>*/}
      {/*  <Logo fontSize={25} collapseWidth={Number.MAX_SAFE_INTEGER} />*/}
      {/*</Navbar.Heading>*/}
      <NavItem to="/">Home</NavItem>
      <NavItem to="/gallery">Gallery</NavItem>
      <NavItem to="/#news">News</NavItem>
      <NavItem to="/how-to-make-a-flow-map">How to make a flow map</NavItem>
      {/*<NavItem to="/tools">Tools</NavItem>*/}
      {/*<NavItem to="/#need-help">Need help?</NavItem>*/}
      <NavItem to="/#credits">Credits</NavItem>
      <NavItem to="/privacy">Privacy</NavItem>
    </NavMenu>
    <Navbar.Group align={Alignment.RIGHT}>
      <LinksArea>
        {/*<Away href="https://github.com/sponsors/ilyabo">*/}
        {/*  <LinkItem>*/}
        {/*    <span>Sponsor</span>*/}
        {/*    <Icon icon={IconNames.HEART} />*/}
        {/*  </LinkItem>*/}
        {/*</Away>*/}
        <Away href="https://github.com/FlowmapBlue/flowmap.blue/discussions">
          <LinkItem>
            <span>Ask a question</span>
            <Image width={20} height={20} alt="Flowmap.blue chat on Spectrum" src={SpectrumLogo} />
          </LinkItem>
        </Away>
        <Away href="https://github.com/FlowmapBlue/flowmap.blue">
          <LinkItem>
            <span>GitHub</span>
            <Image width={20} height={20} alt="Flowmap.blue on GitHub" src={GitHubLogo} />
          </LinkItem>
        </Away>
      </LinksArea>
    </Navbar.Group>
  </NavBar>
);

export default Nav;
