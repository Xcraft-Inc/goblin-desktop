import React from 'react';
import Form from 'laboratory/form';
import Container from 'gadgets/container/widget';
import _ from 'lodash';

class DataGridEntity extends Form {
  constructor() {
    super(...arguments);
  }

  static get wiring() {
    return {
      id: 'id',
    };
  }

  render() {
    const {id, entityUI, columns, datagrid} = this.props;
    const self = this;
    if (!id) {
      return null;
    }

    const Form = this.Form;

    function renderCell(column, index) {
      let CellUI = <div>Missing row cell UI</div>;

      if (entityUI && entityUI.rowCell) {
        CellUI = self.WithState(entityUI.rowCell, 'id')('.id');
      }

      return (
        <CellUI
          key={column.get('name')}
          id={id}
          name={column.get('name')}
          field={column.get('field')}
          index={index}
          theme={self.context.theme}
          entity={self}
          datagrid={datagrid}
          contextId={self.context.contextId}
        />
      );
    }

    return (
      <Form {...self.formConfig}>
        <Container kind="row">
          {columns.map((column, index) => {
            return renderCell(column, index);
          })}
        </Container>
      </Form>
    );
  }
}

export default DataGridEntity;
