import { Colors, Menu, MenuItem, Popover, PopoverInteractionKind, Position } from '@blueprintjs/core'
import React from 'react'
import FlowDirectionIcon from './FlowDirectionIcon'
import { FlowDirection } from './types';
import styled from '@emotion/styled';

export interface Props {
  children: React.ReactNode
  selected: FlowDirection
  onChange: (direction: FlowDirection) => void
}

const SmallMenu = styled(Menu)({
  padding: 5,
  minWidth: 35,
})

const ItemContent = styled.div({
  display: 'flex',
  alignItems: 'center',
  '& > * + *': {
    marginLeft: 10,
  },
})

const Item = styled(MenuItem)((props: { selected: boolean }) =>
  props.selected
    ? {
        backgroundColor: `${Colors.GRAY1} !important`,
        color: '#fff !important',
      }
    : {},
)

const LABELS: Record<FlowDirection, string> = {
  BOTH: 'Both directions',
  IN: 'Incoming',
  OUT: 'Outgoing',
}

const StyledPopover = styled(Popover)({
  position: 'relative',
  top: 7,
  left: -5,
  fontSize: 'smaller',
})

function FlowDirectionDropdown(props: Props) {
  const { children, selected } = props
  return (
    <StyledPopover
      position={Position.BOTTOM_LEFT}
      minimal={true}
      interactionKind={PopoverInteractionKind.CLICK}
      hoverOpenDelay={0}
      hoverCloseDelay={100}
    >
      {children}
      <SmallMenu>
        {Object.keys(FlowDirection).map((key: string) => {
          const dir = FlowDirection[key as FlowDirection]
          const isSelected = selected === dir
          return (
            <Item
              key={key}
              selected={isSelected}
              text={
                <ItemContent>
                  <FlowDirectionIcon
                    color={isSelected ? Colors.GRAY4 : Colors.GRAY3}
                    width={12}
                    height={12}
                    dir={dir}
                  />
                  <span>{LABELS[dir]}</span>
                </ItemContent>
              }
              onClick={() => props.onChange(FlowDirection[key as FlowDirection])}
            />
          )
        })}
      </SmallMenu>
    </StyledPopover>
  )
}

export default FlowDirectionDropdown
