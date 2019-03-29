import React from 'react';
import Widget from 'laboratory/widget';

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
        id={this.props.message.get('id')}
        index={this.props.index.index}
        listId={this.props.index.listId}
        itemId={this.props.index.itemId}
        height={this._height}
        data={this.props.index.data}
      />
    );
  }
}

export default Widget.connect((state, props) => {
  const listIds = state.get(`backend.${props.index.listId}.list`);

  return {
    message: state.get(`backend.${listIds.get(`${props.index.index}`)}`),
  };
})(DatagridItem);
