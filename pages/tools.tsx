import * as React from 'react';
import type {GetServerSideProps} from 'next';

export interface Props {}

const ToolsPage: React.FC<Props> = (props) => {
  const {} = props;
  return null;
};

export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: {
    destination: '/how-to-make-a-flow-map#tools',
    permanent: true,
  },
});

export default ToolsPage;
