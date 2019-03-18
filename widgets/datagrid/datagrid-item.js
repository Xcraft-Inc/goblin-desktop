//T:2019-02-27

import React from 'react';
import Widget from 'laboratory/widget';
import _ from 'lodash';

class DatagridItem extends Widget {
  constructor() {
    super(...arguments);

    this._height = 40;
  }

  render() {
    if (!this.props.message) {
      return <div>Loading... </div>;
    }

    const Item = this.props.renderItem;
    return (
      <Item
        id={item.get('id')}
        index={this.props.index}
        listId={this.props.listId}
        itemId={this.props.itemId}
        height={this._height}
        parentId={this.props.parentId}
      />
    );
  }
}

export default Widget.connect((state, props) => {
  const listIds = state.get(`backend.${props.listId}.list`);

  return {
    id: listIds.get(`${props.index}`, null),
    item: state.get(`backend.${listIds.get(`${props.index}`)}`),
  };
})(DatagridItem);
