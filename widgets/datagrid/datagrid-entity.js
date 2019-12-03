//T:2019-02-27

import React from 'react';
import Form from 'goblin-laboratory/widgets/form';
import Container from 'goblin-gadgets/widgets/container/widget';
import DatagridCell from '../datagrid-cell/widget';

class DatagridEntity extends Form {
  constructor() {
    super(...arguments);

    this.renderCell = this.renderCell.bind(this);
    this.renderCellUI = this.renderCellUI.bind(this);
    this.doAsEntity = this.doAsEntity.bind(this);
    this.doAsDatagrid = this.doAsDatagrid.bind(this);
  }

  static get wiring() {
    return {
      id: 'id',
    };
  }

  doAsEntity(quest, args) {
    this.doFor(this.props.id, quest, args);
  }

  doAsDatagrid(quest, args) {
    this.doFor(this.props.datagridId, quest, args);
  }

  renderCellUI(column, index) {
    const CellUI = this.WithState(this.props.entityUI.rowCell, 'id')('.id');
    return (
      <CellUI
        key={`${this.props.id}_${index}`}
        id={this.props.id}
        index={this.props.index}
        column={column}
        theme={this.context.theme}
        datagridId={this.props.datagridId}
        onDrillDown={this.props.onDrillDown}
        doAsEntity={this.doAsEntity}
        doAsDatagrid={this.doAsDatagrid}
        contextId={this.context.contextId}
      />
    );
  }

  renderCell(index) {
    if (this.props.entityUI && this.props.entityUI.rowCell) {
      return (
        <DatagridCell
          key={`${this.props.id}_${index}`}
          id={this.props.datagridId}
          index={index}
          cellUI={this.renderCellUI}
        />
      );
    }
  }

  render() {
    if (!this.props.id) {
      return null;
    }

    const Form = this.Form;

    return (
      <Form {...this.formConfig} className={this.props.className}>
        <Container kind="row">
          {Array.apply(null, {length: this.props.columnsNo}).map((_, i) => {
            return this.renderCell(i);
          })}
        </Container>
      </Form>
    );
  }
}

export default DatagridEntity;
