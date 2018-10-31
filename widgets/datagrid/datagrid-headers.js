import React from 'react';
import Widget from 'laboratory/widget';
import Form from 'laboratory/form';
import Container from 'gadgets/container/widget';
import Connect from 'laboratory/connect';
import Label from 'gadgets/label/widget';
import _ from 'lodash';

class Header extends Widget {
  constructor() {
    super(...arguments);
    this.tooltips = {
      asc: {
        id: 'ascending order',
      },
      desc: {
        id: 'descending order',
      },
    };
  }

  render() {
    const {
      id,
      index,
      column,
      datagrid,
      doAsDatagrid,
      component,
      headerCell,
      context,
    } = this.props;
    const self = this;

    function renderSortingHeader() {
      return (
        <Connect
          glyph={() => {
            const key = datagrid.getModelValue(`.sort.key`);
            const dir = datagrid.getModelValue(`.sort.dir`);

            if (key === column.get('field')) {
              return dir === 'asc' ? 'solid/arrow-up' : 'solid/arrow-down';
            } else {
              return 'solid/circle';
            }
          }}
          tooltip={() => {
            const key = datagrid.getModelValue(`.sort.key`);
            const dir = datagrid.getModelValue(`.sort.dir`);

            if (key === column.get('field')) {
              return dir === 'asc' ? self.tooltips.asc : self.tooltips.desc;
            } else {
              return null;
            }
          }}
        >
          <Label
            onClick={() =>
              doAsDatagrid('toggle-sort', {
                field: column.get('field'),
              })
            }
            spacing="overlap"
          />
        </Connect>
      );
    }

    function renderComponent() {
      const CellUI = component.WithState(headerCell, 'id')('.id');

      return (
        <CellUI
          key={`${id}_${index}`}
          id={id}
          index={index}
          theme={context.theme}
          column={column}
          datagrid={datagrid}
          doAsDatagrid={doAsDatagrid}
          contextId={context.contextId}
        />
      );
    }

    if (column.get('sortable')) {
      return (
        <div style={{display: 'flex'}}>
          {renderComponent()}
          {renderSortingHeader()}
        </div>
      );
    } else {
      return renderComponent();
    }
  }
}

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
        return (
          <Connect
            key={`${id}_${index}`}
            column={() => datagrid.getModelValue(`.columns[${index}]`)}
          >
            <Header
              key={`${id}_${index}`}
              id={id}
              index={index}
              datagrid={datagrid}
              doAsDatagrid={(quest, args) => {
                const service = datagrid.props.id.split('@')[0];
                self.doAs(service, quest, args);
              }}
              component={self}
              headerCell={entityUI.headerCell}
              context={self.context}
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
