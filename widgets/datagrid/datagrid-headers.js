import React from 'react';
import Widget from 'laboratory/widget';
import Form from 'laboratory/form';
import Container from 'gadgets/container/widget';
import Connect from 'laboratory/connect';
import _ from 'lodash';

class DataGridHeaders extends Form {
  constructor() {
    super(...arguments);
  }

  static get wiring() {
    return {
      id: 'id',
    };
  }

  static connectTo(instance) {
    return Widget.Wired(DataGridHeaders)(`${instance.props.id}`);
  }

  render() {
    const {id, entityUI, columnsSize, datagrid} = this.props;
    const self = this;
    if (!id) {
      return null;
    }

    const Form = this.Form;

    function renderCell(index) {
      if (entityUI && entityUI.headerCell) {
        const CellUI = self.WithState(entityUI.headerCell, 'id')('.id');

        return (
          <Connect
            key={`${id}_${index}`}
            column={() => datagrid.getModelValue(`.columns[${index}]`)}
          >
            <CellUI
              key={`${id}_${index}`}
              id={id}
              index={index}
              theme={self.context.theme}
              datagrid={datagrid}
              contextId={self.context.contextId}
            />
          </Connect>
        );
      }
    }

    return (
      <Form {...self.formConfig}>
        <Container kind="row">
          {Array.apply(null, {length: columnsSize}).map((_, i) => {
            return renderCell(i);
          })}
        </Container>
      </Form>
    );
  }
}

export default DataGridHeaders;
