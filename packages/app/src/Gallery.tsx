import React from 'react';
import Nav from './Nav';
import styled from '@emotion/styled';
import { Classes, Colors, Intent, Tag } from '@blueprintjs/core';
import { aspectRatio, examples, screenshotSizes } from './examples.json';
import { Link } from 'react-router-dom';

const ContentBody = styled.div`
  padding: 30px 30px;
  & h1 {
    font-size: 2rem;
  }
  & li {
    margin: 0.5em 0;
  }
  margin: auto;
  max-width: 1500px;
`;

const HoverableLink = styled(Link)`
  width: 100%;
  overflow: hidden;
  border: 1px solid ${Colors.GRAY2};
  transition: border 0.25s;
  &:hover {
    border: 1px solid ${Colors.LIGHT_GRAY1};
  }
`;

const ExampleGridHoverableLink = styled(HoverableLink)`
  position: relative;
  width: 100%;
  &:hover {
    & > .name {
      color: ${Colors.LIGHT_GRAY1};
    }
  }
`;
const ExampleTitle = styled.div`
  width: 100%;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  position: absolute;
  padding: 4px 7px;
  bottom: 0;
  background: ${Colors.DARK_GRAY2};
  color: ${Colors.GRAY3};
  font-size: 9pt;
  z-index: 2;
  pointer-events: none;
  transition: color 0.25s;
  text-align: center;
  border-top: 1px solid rgba(19, 124, 189, 0.25);
`;
const ExampleImage = styled.div`
  img {
    display: block;
    height: auto;
    width: 100%;
    position: absolute;
    top: 0;
    transform: scale(1);
    transition: transform 0.5s;
    &:hover {
      transform: scale(1.5);
    }
  }
  &:before {
    // persistent aspect ratio trick https://stackoverflow.com/a/51578598/120779
    content: '';
    display: block;
    height: 0;
    width: 0;
    padding-bottom: calc(${1 / aspectRatio} * 100%);
  }
`;

const ExampleGrid = styled.div`
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
    <>
      <Nav />
      <ContentBody className={Classes.DARK}>
        <h1>Gallery</h1>
        <section>
          <p>
            Here are some of the flow maps people have been publishing. Want yours to be featured?{' '}
            <a href="mailto:ilya@boyandin.me?subject=Flowmap.blue">Let us know</a>.
          </p>
          <ExampleGrid>
            {examples.map(({ key, sheet, name, query }) => (
              <ExampleGridHoverableLink
                key={key}
                to={`/${key}${sheet ? `/${sheet}` : ''}${query ? `?${query}` : ''}`}
              >
                <ExampleImage>
                  <ExampleTitle className="name">{name}</ExampleTitle>
                  <img
                    width={screenshotSizes[0]}
                    height={Math.floor(screenshotSizes[0] / aspectRatio)}
                    alt={name}
                    src={`/screenshots/${key}${sheet ? `_${sheet}` : ''}__${
                      screenshotSizes[0]
                    }px.jpg`}
                    // srcSet={screenshotSizes.map(w => `/screenshots/${key}__${w}px.jpg ${w}w`).join(',')}
                    // sizes={screenshotSizes.map((w, i) =>
                    //   (i < screenshotSizes.length - 1 ? `(max-width: ${w * 2}px) ` : '') + `${w}px`)
                    //   .join(',')
                    // }
                  />
                </ExampleImage>
              </ExampleGridHoverableLink>
            ))}
          </ExampleGrid>
        </section>
      </ContentBody>
    </>
  );
};

export default Gallery;
