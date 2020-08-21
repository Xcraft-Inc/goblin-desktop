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
        hasFilter={this.props.hasFilter}
        itemId={this.props.itemId}
        columns={this.props.columns}
        settings={this.props.settings}
        rowIndex={this.props.rowIndex}
        selected={this.props.selected}
        onDrillDown={this.props.onDrillDown}
        onSelect={this.props.onSelect}
        onEdit={this.props.onEdit}
        useView={this.props.useView}
        listId={this.props.listId}
        variant={this.props.variant}
      />
    );
  }
}

export default Widget.connect((state, props) => {
  const id = state.get(`backend.${props.listId}.list.${props.itemId}`, null);

  let selectedRowId = null;
  let selectedEntityId = null;
  if (props.data.serviceId) {
    selectedRowId = state.get(`widgets.${props.data.serviceId}.selectedRowId`);
    selectedEntityId = state.get(
      `widgets.${props.data.serviceId}.selectedEntityId`
    );
  }

  return {
    id,
    itemId: props.itemId,
    firstColumnWidth: props.data.firstColumnWidth,
    filterPaths: props.data.filterPaths,
    hasFilter: props.data.hasFilter,
    columns: props.data.columns,
    settings: props.data.settings,
    onDrillDown: props.data.onDrillDown,
    onSelect: props.data.onSelect,
    onEdit: props.data.onEdit,
    rowIndex: props.index,
    useView: props.data.useView,
    variant: props.data.variant,
    selected:
      `${selectedRowId}-item` === props.itemId && selectedEntityId === id,
  };
})(EntityListItem);
