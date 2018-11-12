import React from 'react';
import Form from 'laboratory/form';
import Container from 'gadgets/container/widget';
import DatagridCell from '../datagrid-cell/widget';
import _ from 'lodash';

class DatagridEntity extends Form {
  constructor() {
    super(...arguments);

    this.renderCell = this.renderCell.bind(this);
  }

  static get wiring() {
    return {
      id: 'id',
    };
  }

  renderCell(index) {
    if (this.props.entityUI && this.props.entityUI.rowCell) {
      const CellUI = this.WithState(this.props.entityUI.rowCell, 'id')('.id');

      return (
        <DatagridCell
          id={this.props.datagrid.props.id}
          index={index}
          cellUI={column => {
            return (
              <CellUI
                key={`${this.props.id}_${this.props.index}`}
                id={this.props.id}
                index={this.props.index}
                column={column}
                theme={this.context.theme}
                entity={this}
                datagrid={this.props.datagrid}
                doAsEntity={(quest, args) =>
                  this.doFor(this.props.id, quest, args)
                }
                doAsDatagrid={(quest, args) =>
                  this.doFor(this.props.datagrid.props.id, quest, args)
                }
                contextId={this.context.contextId}
              />
            );
          }}
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
