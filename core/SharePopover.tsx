import {Button, Classes, Popover, Position, Switch, Tab, Tabs} from '@blueprintjs/core';
import {Column} from './Boxes';
import * as React from 'react';
import styled from '@emotion/styled';
import {IconNames} from '@blueprintjs/icons';
import {FC, ReactNode, useState} from 'react';

const Outer = styled(Column)`
  padding: 10px 20px 10px 20px;
  font-size: 12px;
`;

const StyledTextArea = styled.textarea<{multiline?: boolean}>(
  (props) => `
  @media (min-width: 500px) {
     width: 30em;
  }
  width: 18em;
  min-height: ${props.multiline ? '10em;' : '6em'};
  overflow: hidden;
  font-family: monospace;
`,
);

const Group = styled.div`
  position: relative;
`;

const CopyButton = styled(Button)`
  position: absolute;
  top: 10px;
  right: 10px;
`;

const CopyInput: FC<{text: string; embed?: boolean}> = ({text, embed}) => {
  const textAreaRef = React.useRef<HTMLTextAreaElement>(null);
  const handleCopyToClipboard = () => {
    const input = textAreaRef.current;
    if (input) {
      input.select();
      document.execCommand('copy');
    }
  };
  return (
    <Column spacing={5}>
      <Group>
        <StyledTextArea
          className={Classes.INPUT}
          ref={textAreaRef}
          readOnly={true}
          value={text}
          multiline={embed}
        />
        <CopyButton
          icon={IconNames.DUPLICATE}
          title="Copy to clipboard"
          onClick={handleCopyToClipboard}
        />
      </Group>
    </Column>
  );
};

interface Props {
  children: ReactNode;
  queryParams: Record<string, string>;
  scaleLocked: boolean;
}

const SharePopover: FC<Props> = ({children, queryParams, scaleLocked}) => {
  const [selectedTab, setSelectedTab] = useState('url');
  const [withState, setWithState] = useState<boolean>();
  const includeCurrentView = withState ?? scaleLocked;
  const query = includeCurrentView ? `?${new URLSearchParams(queryParams)}` : '';
  const mapUrl = `${location.origin}${location.pathname}`;
  return (
    <Popover
      hoverOpenDelay={0}
      hoverCloseDelay={0}
      position={Position.RIGHT_BOTTOM}
      content={
        <Outer spacing={15}>
          <Tabs selectedTabId={selectedTab} onChange={(newTabId) => setSelectedTab(`${newTabId}`)}>
            <Tab id="url" title="Share URL" panel={<CopyInput text={`${mapUrl}${query}`} />} />
            <Tab
              id="embed"
              title="Embed code"
              panel={
                <CopyInput
                  embed={true}
                  text={
                    `<iframe width="800" height="600" ` +
                    `src="${mapUrl}/embed${query}" ` +
                    `frameborder="0" allowfullscreen></iframe>`
                  }
                />
              }
            />
          </Tabs>
          <Switch
            checked={includeCurrentView}
            onChange={() => setWithState(!includeCurrentView)}
            label="Current view of the map"
          />
        </Outer>
      }
    >
      {children}
    </Popover>
  );
};

export default SharePopover;
