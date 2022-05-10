import React from 'react';
import Layout from '../core/Layout';
import Gallery from '../components/Gallery';
import Head from 'next/head';

const GalleryPage = () => {
  return (
    <Layout>
      <Head>
        <title>Gallery – FlowmapBlue</title>
      </Head>
      <h1>Gallery</h1>
      <section>
        <p>
          Here are some of the flow maps people have been publishing. Want yours to be featured?{' '}
          <a href="mailto:ilya@boyandin.me?subject=FlowmapBlue">Let us know</a>.
        </p>
        <Gallery />
      </section>
    </Layout>
  );
};

export default GalleryPage;
