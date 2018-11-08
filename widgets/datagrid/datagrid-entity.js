import React from 'react';
import Form from 'laboratory/form';
import Container from 'gadgets/container/widget';
import Connect from 'laboratory/connect';
import DatagridCell from '../datagrid-cell/widget';
import _ from 'lodash';

class DatagridEntity extends Form {
  constructor() {
    super(...arguments);
  }

  static get wiring() {
    return {
      id: 'id',
    };
  }

  render() {
    const {id, entityUI, columnsNo, datagrid} = this.props;
    const self = this;
    if (!id) {
      return null;
    }

    const Form = this.Form;

    function renderCell(index) {
      if (entityUI && entityUI.rowCell) {
        const CellUI = self.WithState(entityUI.rowCell, 'id')('.id');

        return (
          <Connect
            key={`${id}_${index}`}
            column={() => datagrid.getModelValue(`.columns[${index}]`)}
          >
            <DatagridCell
              cellUI={column => {
                return (
                  <CellUI
                    key={`${id}_${index}`}
                    id={id}
                    index={index}
                    column={column}
                    theme={self.context.theme}
                    entity={self}
                    datagrid={datagrid}
                    doAsEntity={(quest, args) => {
                      const service = self.props.id.split('@')[0];
                      self.doAs(service, quest, args);
                    }}
                    doAsDatagrid={(quest, args) => {
                      const service = datagrid.props.id.split('@')[0];
                      self.doAs(service, quest, args);
                    }}
                    contextId={self.context.contextId}
                  />
                );
              }}
            />
          </Connect>
        );
      }
    }

    return (
      <Form {...self.formConfig} className={this.props.className}>
        <Container kind="row">
          {Array.apply(null, {length: columnsNo}).map((_, i) => {
            return renderCell(i);
          })}
        </Container>
      </Form>
    );
  }
}

export default DatagridEntity;
