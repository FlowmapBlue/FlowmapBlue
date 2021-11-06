import React from 'react';
import styled from '@emotion/styled';
import { Colors, Intent, Tag } from '@blueprintjs/core';
import examplesConfig from '../examples.json';
import Link from 'next/link';
import Image from 'next/image';
import Layout from '../core/Layout';

const { aspectRatio, examples, screenshotSizes } = examplesConfig;

const LinkItem = styled.div`
  cursor: pointer !important;
  width: 100%;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0);
  transition: border 0.25s;
  &:hover {
    border: 1px solid ${Colors.LIGHT_GRAY1};
  }
  position: relative;
  width: 100%;
  &:hover {
    & > .name {
      color: ${Colors.LIGHT_GRAY1};
    }
  }
`;

const ItemTitle = styled.div`
  width: 100%;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  position: absolute;
  bottom: 0;
  padding: 4px 7px;
  background: ${Colors.DARK_GRAY1};
  color: ${Colors.GRAY3};
  font-size: 9pt;
  z-index: 2;
  pointer-events: none;
  transition: color 0.25s;
  text-align: center;
  border-top: 1px solid rgba(19, 124, 189, 0.1);
`;
const ItemImage = styled.div`
  img {
    display: block;
    height: auto;
    width: 100%;
    //position: absolute;
    //top: 0;
    transform: scale(1);
    transition: transform 0.5s;
    &:hover {
      transform: scale(1.5);
    }
  }
  // &:before {
  //   // persistent aspect ratio trick https://stackoverflow.com/a/51578598/120779
  //   content: '';
  //   display: block;
  //   height: 0;
  //   width: 0;
  //   padding-bottom: calc(${1 / aspectRatio} * 100%);
  // }
`;

const ItemGrid = styled.div`
  margin-top: 2em;
  display: grid;
  grid-gap: 20px;
  grid-template-columns: 1fr;
  @media (min-width: 500px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (min-width: 650px) {
    grid-template-columns: repeat(3, 1fr);
  }
  @media (min-width: 800px) {
    grid-template-columns: repeat(4, 1fr);
  }
  @media (min-width: 1000px) {
    grid-template-columns: repeat(5, 1fr);
  }
  @media (min-width: 1200px) {
    grid-template-columns: repeat(6, 1fr);
  }
`;

export const ListOfUses = styled.div`
  display: flex;
  // border-radius: 6px;
  // background-color: ${Colors.DARK_GRAY3};
  flex-wrap: wrap;
  list-style-type: none;
  padding: 0.5em 1em;
  margin: 1em 0;
`;

export const ListOfUsesItem = styled(({ className, children }) => (
  <Tag className={className} minimal round interactive={false} intent={Intent.NONE}>
    {children}
  </Tag>
))`
  margin: 5px;
`;

const Gallery = () => {
  return (
    <Layout>
      <h1>Gallery</h1>
      <section>
        <p>
          Here are some of the flow maps people have been publishing. Want yours to be featured?{' '}
          <a href="mailto:ilya@boyandin.me?subject=Flowmap.blue">Let us know</a>.
        </p>
        <ItemGrid>
          {examples.map(({ key, sheet, name, query }) => {
            const src = `/screenshots/${key}${sheet ? `_${sheet}` : ''}__${
              screenshotSizes[0]
            }px.jpg`;
            return (
              <Link
                key={key}
                href={`/${key}${sheet ? `/${sheet}` : ''}${query ? `?${query}` : ''}`}
              >
                <LinkItem>
                  <ItemImage>
                    <ItemTitle className="name">{name}</ItemTitle>
                    <Image
                      width={screenshotSizes[0]}
                      height={Math.floor(screenshotSizes[0] / aspectRatio)}
                      alt={name}
                      src={src}
                      blurDataURL={src}
                      placeholder="blur"
                      // srcSet={screenshotSizes.map(w => `/screenshots/${key}__${w}px.jpg ${w}w`).join(',')}
                      // sizes={screenshotSizes.map((w, i) =>
                      //   (i < screenshotSizes.length - 1 ? `(max-width: ${w * 2}px) ` : '') + `${w}px`)
                      //   .join(',')
                      // }
                    />
                  </ItemImage>
                </LinkItem>
              </Link>
            );
          })}
        </ItemGrid>
      </section>
    </Layout>
  );
};

export default Gallery;
