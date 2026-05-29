import React from 'react';
import Layout from '../core/Layout';
import Gallery from '../components/Gallery';
import Seo from '../components/Seo';

const GalleryPage = () => {
  return (
    <Layout>
      <Seo title="Gallery – FlowmapBlue" path="/gallery" />
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
