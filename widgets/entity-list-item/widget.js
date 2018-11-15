import React from 'react';
import Widget from 'laboratory/widget';
import EntityRow from 'desktop/entity-row/widget';
import Container from 'gadgets/container/widget';

class EntityListItem extends Widget {
  constructor() {
    super(...arguments);
  }

  render() {
    const containerProps = {};
    if (!this.props.id && this.props.height) {
      containerProps.height = `${this.props.height}px`;
    }
    return (
      <Container {...containerProps} grow="1" busy={!this.props.id}>
        {this.props.id ? (
          <EntityRow
            id={this.props.id}
            itemId={this.props.itemId}
            columns={this.props.columns}
            rowIndex={this.props.rowIndex}
            onDrillDown={this.props.onDrillDown}
          />
        ) : null}
      </Container>
    );
  }
}

export default Widget.connect((state, props) => {
  const id = state.get(`backend.${props.listId}.list.${props.itemId}`, null);
  return {
    id,
    height: props.height,
    itemId: props.itemId,
    columns: props.parentId.columns,
    onDrillDown: props.parentId.onDrillDown,
    rowIndex: props.index,
  };
})(EntityListItem);
