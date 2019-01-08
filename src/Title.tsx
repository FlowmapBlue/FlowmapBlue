import { colors } from './colors';
import { Link } from 'react-router-dom';
import * as React from 'react';
import logo from './logo.png';

type Props = {
  fontSize?: number
}

const Title = ({ fontSize = 20 }: Props) => {
  const shadow = colors.flows.max
  return <Link to="/" style={{ textDecoration: 'none' }}>
    <div style={{
      fontSize,
      fontWeight: 'bold',
      textShadow: `1px -1px 1px ${shadow}, 1px 1px 1px ${shadow}, -1px -1px 1px ${shadow}, -1px 1px 1px ${shadow}`,
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
    }}>
      <img src={logo} height={fontSize * 1.2} style={{ marginRight: fontSize / 5 }}/>
      flowmap.blue
    </div>
  </Link>
}


export default Title
