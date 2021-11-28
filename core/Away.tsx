import * as React from 'react';

const Away = ({href, children}: {href: string; children: React.ReactChild}) => (
  <a href={href} target="_blank" rel="noopener noreferrer">
    {children}
  </a>
);

export default Away;
