import { Button, Classes, InputGroup, Popover, Position } from '@blueprintjs/core';
import { Column, LegendTitle } from './Boxes';
import * as React from 'react';
import styled from '@emotion/styled';
import { IconNames } from '@blueprintjs/icons';
import { useLocation } from 'react-router-dom';
import { FC } from 'react';


const Outer = styled(Column)`
  font-size: 12px;
  padding: 20px;
`


const StyledInputGroup = styled(InputGroup)`
  @media (min-width: 500px) {
     width: 30em;
  }
  & .${Classes.INPUT} {
    font-family: monospace;
    font-size: 10px;
  }
`

const CopyInput: FC<{ title: string, text: string }> = ({ title, text }) => {
  const inputRef = React.createRef<HTMLInputElement>()
  const handleCopyToClipboard = () => {
    const input = inputRef.current
    if (input) {
      input.select()
      document.execCommand('copy')
    }
  }
  return (
    <Column spacing={10}>
      <LegendTitle>{title}</LegendTitle>
      <StyledInputGroup
        // @ts-ignore
        inputRef={inputRef}
        readOnly={true}
        leftIcon={IconNames.LINK}
        rightElement={
          <Button
            icon={IconNames.DUPLICATE}
            title="Copy to clipboard"
            onClick={handleCopyToClipboard}
          />
        }
        value={text}
      />
    </Column>
  );
}

const SharePopover: React.FC<{}> = ({ children }) => {
  const location = useLocation();
  return (
    <Popover
      hoverOpenDelay={0}
      hoverCloseDelay={0}
      position={Position.LEFT}
      content={
        <Outer spacing={20}>
          <CopyInput
            title="Share the URL of the initial state of this flow map"
            text={`${document.location.protocol}//${document.location.host}${location.pathname}`}
          />
          <CopyInput
            title="Share the URL of the current state (viewport, selection…)"
            text={`${document.location.protocol}//${document.location.host}${location.pathname}?${location.search}`}
          />
        </Outer>
      }
    >
      {children}
    </Popover>
  )
}

export default SharePopover;
