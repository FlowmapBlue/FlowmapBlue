import React, {ReactNode, useState} from 'react';
import {Classes, Icon} from '@blueprintjs/core';
import {Away} from '../core';
import GitHubLogo from '../public/images/github.svg';
import styled from '@emotion/styled';
import Link from 'next/link';
import Image from 'next/image';
import {IconNames} from '@blueprintjs/icons';
import Logo from '../core/Logo';

const BG_COLOR = 'rgb(38, 50, 71)';

const BREAKPOINT_WIDTH = 850;
const Outer = styled.div`
  display: flex;
  width: 100%;
  padding: 5px;
  background-color: ${BG_COLOR} !important;

  box-shadow: inset 0 0 0 1px rgb(16 22 26 / 20%), 0 0 0 rgb(16 22 26 / 0%),
    0 1px 1px rgb(16 22 26 / 40%);

  .menu-button {
    display: none;
  }

  .nav-links {
    display: flex;
    font-weight: 400;
    width: 100%;
    flex-direction: row;
  }

  .logo {
    //display: flex;
    //align-items: center;
    ////border: 1px solid red;
    //margin-right: 20px;
    position: absolute;
    top: 10px;
    left: 10px;
  }

  &.hide-logo {
    .logo {
      display: none;
    }
  }

  .right-links {
    flex-grow: 1;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    margin-right: 10px;
    & > * + * {
      margin-left: 20px;
    }
  }

  @media screen and (min-width: ${BREAKPOINT_WIDTH}px) {
    &:not(.hide-logo) {
      .nav-links {
        margin-left: 50px;
      }
    }
  }
  @media screen and (max-width: ${BREAKPOINT_WIDTH}px) {
    justify-content: flex-end;

    .menu-button {
      display: flex;
    }
    .nav-links {
      margin-left: 0px;
      background-color: ${BG_COLOR};
      flex-direction: column;
    }
    :not(.responsive) {
      .nav-links {
        display: none;
      }
    }
    &.responsive {
      .menu-button {
        position: absolute;
      }
    }
    .right-links {
      padding: 20px;
      margin-right: 0;
      justify-content: center;
    }
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

const NavItem = ({to, children}: {to: string; children: ReactNode}) => (
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
    <a
      className={[Classes.INTENT_PRIMARY, Classes.BUTTON, Classes.MINIMAL, Classes.LARGE].join(' ')}
    >
      {children}
    </a>
  </Link>
);

const Nav = () => {
  const [hamburgerOpen, setHamburgerOpen] = useState(false);
  const toggleHamburger = () => {
    setHamburgerOpen(!hamburgerOpen);
  };

  const navLinks = (
    <>
      <NavItem to="/">Home</NavItem>
      <NavItem to="/gallery">Gallery</NavItem>
      <NavItem to="/news">News</NavItem>
      <NavItem to="/how-to-make-a-flow-map">How to make a flow map</NavItem>
      <NavItem to="/privacy">Privacy</NavItem>
      <NavItem to="/credits">Credits</NavItem>
      <div className="right-links">
        {/*<Away href="https://github.com/sponsors/ilyabo">*/}
        {/*  <LinkItem>*/}
        {/*    <span>Sponsor</span>*/}
        {/*    <Icon icon={IconNames.HEART} />*/}
        {/*  </LinkItem>*/}
        {/*</Away>*/}
        <Away href="https://github.com/FlowmapBlue/flowmap.blue/discussions">
          <LinkItem>
            <span>Ask a question</span>
          </LinkItem>
        </Away>
        <Away href="https://github.com/FlowmapBlue/flowmap.blue">
          <LinkItem>
            <span>GitHub</span>
            <Image width={20} height={20} alt="Flowmap.blue on GitHub" src={GitHubLogo} />
          </LinkItem>
        </Away>
      </div>
    </>
  );

  return (
    <Outer
      className={[
        Classes.DARK,
        hamburgerOpen ? 'responsive' : '',
        // route === '/' ? 'hide-logo' : '',
      ].join(' ')}
    >
      <div className="logo">
        <Logo fontSize={20} showText={false} />
      </div>
      <div
        className={[
          'menu-button',
          Classes.INTENT_PRIMARY,
          Classes.BUTTON,
          Classes.MINIMAL,
          Classes.LARGE,
        ].join(' ')}
        title="Menu"
        onClick={toggleHamburger}
      >
        <Icon icon={hamburgerOpen ? IconNames.CROSS : IconNames.MENU} size={22} />
      </div>
      <div className="nav-links">{navLinks}</div>
    </Outer>
  );
};

export default Nav;
