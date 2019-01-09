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
        id={this.props.id}
        key={this.props.index}
        index={this.props.index}
        listId={this.props.listId}
        itemId={`${this.props.index}-item`}
        height={this._height}
        parentId={this.props.parentId}
      />
    );
  }
}

export default Widget.connect((state, props) => {
  return {
    message: state.get(`backend.${props.id}`),
  };
})(DatagridItem);
