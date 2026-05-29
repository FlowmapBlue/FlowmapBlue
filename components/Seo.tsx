import Head from 'next/head';
import manifest from '../public/manifest.json';

export const SITE_URL = 'https://www.flowmap.blue';
export const DEFAULT_DESCRIPTION = manifest.description;

type Props = {
  title?: string;
  description?: string;
  path?: string;
  noindex?: boolean;
};

const normalizePath = (path: string = '/') => (path.startsWith('/') ? path : `/${path}`);

const Seo = ({title, description = DEFAULT_DESCRIPTION, path = '/', noindex}: Props) => {
  const canonicalUrl = `${SITE_URL}${normalizePath(path)}`;
  return (
    <Head>
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
      <link href={canonicalUrl} rel="canonical" />
      {noindex && <meta name="robots" content="noindex,follow" />}
    </Head>
  );
};

export default Seo;
