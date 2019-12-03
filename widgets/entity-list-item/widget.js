//T:2019-02-27
import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import EntityRow from 'goblin-desktop/widgets/entity-row/widget';
import Container from 'goblin-gadgets/widgets/container/widget';

class EntityListItem extends Widget {
  constructor() {
    super(...arguments);
  }

  render() {
    const height = '28px';
    return (
      <Container height={height} grow="1">
        <EntityRow
          id={this.props.id}
          height={height}
          itemId={this.props.itemId}
          columns={this.props.columns}
          rowIndex={this.props.rowIndex}
          onDrillDown={this.props.onDrillDown}
        />
      </Container>
    );
  }
}

export default Widget.connect((state, props) => {
  const id = state.get(`backend.${props.listId}.list.${props.itemId}`, null);
  return {
    id,
    itemId: props.itemId,
    columns: props.data.columns,
    onDrillDown: props.data.onDrillDown,
    rowIndex: props.index,
  };
})(EntityListItem);
