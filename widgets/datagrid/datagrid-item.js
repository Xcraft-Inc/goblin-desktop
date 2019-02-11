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
        id={this.props.index.id}
        key={this.props.index.key}
        index={this.props.index.index}
        listId={this.props.index.listId}
        itemId={this.props.index.itemId}
        height={this._height}
        parentId={this.props.index.parentId}
      />
    );
  }
}

export default Widget.connect((state, props) => {
  return {
    message: state.get(`backend.${props.index.id}`),
  };
})(DatagridItem);
