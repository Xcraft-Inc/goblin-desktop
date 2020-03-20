//T:2019-02-27
import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import EntityRow from 'goblin-desktop/widgets/entity-row/widget';

class EntityListItem extends Widget {
  constructor() {
    super(...arguments);
  }

  render() {
    return (
      <EntityRow
        id={this.props.id}
        minHeight="28px"
        maxHeight="200px"
        firstColumnWidth={this.props.firstColumnWidth}
        filterPaths={this.props.filterPaths}
        itemId={this.props.itemId}
        columns={this.props.columns}
        settings={this.props.settings}
        rowIndex={this.props.rowIndex}
        selected={this.props.selected}
        onDrillDown={this.props.onDrillDown}
        onSelect={this.props.onSelect}
        onEdit={this.props.onEdit}
        useView={this.props.useView}
      />
    );
  }
}

export default Widget.connect((state, props) => {
  const id = state.get(`backend.${props.listId}.list.${props.itemId}`, null);

  let selectedRowId = null;
  if (props.data.serviceId) {
    selectedRowId = state.get(`widgets.${props.data.serviceId}.selectedRowId`);
  }

  return {
    id,
    itemId: props.itemId,
    firstColumnWidth: props.data.firstColumnWidth,
    filterPaths: props.data.filterPaths,
    columns: props.data.columns,
    settings: props.data.settings,
    onDrillDown: props.data.onDrillDown,
    onSelect: props.data.onSelect,
    onEdit: props.data.onEdit,
    rowIndex: props.index,
    useView: props.data.useView,
    selected: `${selectedRowId}-item` === props.itemId,
  };
})(EntityListItem);
