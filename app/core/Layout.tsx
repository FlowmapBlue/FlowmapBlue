import Nav from '../components/Nav';
import {Classes} from '@blueprintjs/core';
import * as React from 'react';
import styled from '@emotion/styled';

export interface Props {}
const ContentBody = styled.div`
  padding: 10px 20px;
  @media (min-width: 500px) {
    padding: 20px 60px;
  }
  & h1 {
    font-size: 2rem;
  }
  margin: auto;
  max-width: 1500px;
`;

const Layout: React.FC<Props> = (props) => {
  const {children} = props;
  return (
    <>
      <Nav />
      <ContentBody className={Classes.DARK}>{children}</ContentBody>
    </>
  );
};

export default Layout;
