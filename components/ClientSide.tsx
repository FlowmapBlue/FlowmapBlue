import {FC, ReactNode, useEffect, useState} from 'react';
import {LoadingSpinner} from '../core';

export interface Props {
  render: () => ReactNode;
}

const ClientSide: FC<Props> = (props) => {
  const {render} = props;
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    (async () => {
      setMounted(true);
    })();
  }, []);

  return <>{mounted ? render() : <LoadingSpinner />}</>;
};

export default ClientSide;
