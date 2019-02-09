import { Button, Classes, IPopoverProps, MenuItem } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { ItemPredicate, ItemRenderer, MultiSelect } from '@blueprintjs/select';
import React from 'react';
import { defaultMemoize } from 'reselect';
import styled from '@emotion/styled';

export interface Props<Item> {
  placeholder: string;
  items: Item[];
  maxItems: number;
  selectedItems: Item[] | undefined;
  itemPredicate: ItemPredicate<Item>;
  itemRenderer: ItemRenderer<Item>;
  tagRenderer: (item: Item) => React.ReactNode;
  onSelected: (item: Item) => void;
  onRemoved: (item: Item) => void;
  onCleared: () => void;
  onQueryChange?: (query: string) => void;
}

const NoResultsItem = <MenuItem disabled={true} text="No matches." />;

const popoverProps: Partial<IPopoverProps> = {
  minimal: true,
  usePortal: false,
  hoverOpenDelay: 0,
};

interface State {
  query: string;
}

function filterItems<Item>(items: Item[], query: string, itemPredicate: ItemPredicate<Item>, maxLength: number) {
  const matches: Item[] = [];
  if (!items || items.length === 0) {
    return matches;
  }
  for (const item of items) {
    if (itemPredicate(query, item)) {
      matches.push(item);
    }
    if (matches.length >= maxLength) {
      break;
    }
  }
  return matches;
}

const Outer = styled.div`
  .bp3-popover-target {
    width: 10rem;
  }
`

export default class SearchBox<Item> extends React.PureComponent<Props<Item>, State> {
  state = {
    query: '',
  };

  getFilteredItems = defaultMemoize(filterItems);

  render() {
    const {
      items,
      selectedItems,
      itemRenderer,
      placeholder,
      tagRenderer,
      onCleared,
      onSelected,
      itemPredicate,
      maxItems,
    } = this.props;
    const { query } = this.state;

    const tagInputProps = {
      placeholder,
      onRemove: this.handleItemRemoved,
      rightElement:
        selectedItems && selectedItems.length > 0 ? (
          <Button icon={IconNames.CROSS} minimal={true} onClick={onCleared} />
        ) : (
          undefined
        ),
    };

    return (
      <Outer>
        <MultiSelect<Item>
          items={this.getFilteredItems<Item>(items, query, itemPredicate, maxItems)}
          selectedItems={selectedItems}
          itemRenderer={itemRenderer}
          tagRenderer={tagRenderer}
          noResults={NoResultsItem}
          resetOnSelect={true}
          popoverProps={popoverProps}
          tagInputProps={tagInputProps}
          onItemSelect={onSelected}
          openOnKeyDown={true}
          onQueryChange={this.handleQueryChange}
        />
      </Outer>
    );
  }

  private handleQueryChange = (query: string) => {
    this.setState({
      query,
    });
    const { onQueryChange } = this.props;
    if (onQueryChange) {
      onQueryChange(query);
    }
  };

  private handleItemRemoved = (value: string, index: number) => {
    const { selectedItems, onRemoved } = this.props;
    if (selectedItems) {
      onRemoved(selectedItems[index]);
    }
  };
}
