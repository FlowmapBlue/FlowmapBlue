import Link from 'next/link';
import Image from 'next/image';
import React, {useMemo} from 'react';
import examplesConfig from '../examples.json';
import styled from '@emotion/styled';
import {Colors, Icon} from '@blueprintjs/core';
import {IconNames} from '@blueprintjs/icons';

const {aspectRatio, examples, screenshotSizes} = examplesConfig;

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

const MoreBox = styled.div`
  display: flex;
  align-items: center;
  //justify-content: center;
  width: 100%;
  height: 100%;
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

type Props = {
  maxCount?: number;
};

const Gallery = (props: Props) => {
  const {maxCount} = props;
  const examplesToShow = useMemo(
    () => (maxCount ? examples.slice(0, maxCount) : examples),
    [maxCount],
  );
  return (
    <ItemGrid>
      {examplesToShow.map(({key, sheet, name, query}) => {
        const src = `/screenshots/${key}${sheet ? `_${sheet}` : ''}__${screenshotSizes[0]}px.jpg`;
        return (
          <Link key={key} href={`/${key}${sheet ? `/${sheet}` : ''}${query ? `?${query}` : ''}`}>
            <a>
              <LinkItem>
                <ItemImage>
                  <ItemTitle className="name">{name}</ItemTitle>
                  <Image
                    width={screenshotSizes[0]}
                    height={Math.floor(screenshotSizes[0] / aspectRatio)}
                    alt={name}
                    src={src}
                    blurDataURL={'/screenshots/placeholder-50x50.jpg'}
                    placeholder="blur"
                    // srcSet={screenshotSizes.map(w => `/screenshots/${key}__${w}px.jpg ${w}w`).join(',')}
                    // sizes={screenshotSizes.map((w, i) =>
                    //   (i < screenshotSizes.length - 1 ? `(max-width: ${w * 2}px) ` : '') + `${w}px`)
                    //   .join(',')
                    // }
                  />
                </ItemImage>
              </LinkItem>
            </a>
          </Link>
        );
      })}
      {maxCount && maxCount < examples.length ? (
        <Link href="/gallery">
          <a>
            <MoreBox>
              <Icon icon={IconNames.ARROW_RIGHT} /> &nbsp; More examples
            </MoreBox>
          </a>
        </Link>
      ) : null}
    </ItemGrid>
  );
};

export default Gallery;
