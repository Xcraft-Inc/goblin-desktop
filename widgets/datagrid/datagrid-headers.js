import React from 'react';
import Widget from 'laboratory/widget';
import Form from 'laboratory/form';
import Container from 'gadgets/container/widget';
import Connect from 'laboratory/connect';
import Label from 'gadgets/label/widget';
import Field from 'gadgets/field/widget';
import DatagridCell from '../datagrid-cell/widget';
import _ from 'lodash';

class Header extends Widget {
  constructor() {
    super(...arguments);
    this.tooltips = {
      asc: {
        nabuId: 'ascending order',
      },
      desc: {
        nabuId: 'descending order',
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
              return dir === 'asc'
                ? 'solid/sort-alpha-up'
                : 'solid/sort-alpha-down';
            } else {
              return 'solid/sort';
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
        <DatagridCell
          cellUI={column => {
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
          }}
          column={column}
        />
      );
    }

    if (column.get('sortable')) {
      return (
        <DatagridCell
          column={column}
          margin="0px"
          cellUI={_ => {
            return (
              <Container kind="row" width={column.get('width')}>
                {renderComponent()}
                {renderSortingHeader()}
              </Container>
            );
          }}
        />
      );
    } else {
      return renderComponent();
    }
  }
}

class Filter extends Widget {
  render() {
    const {column, doAsDatagrid} = this.props;

    if (
      column.get('field') &&
      column.get('field') !== '' &&
      column.get('filterable')
    ) {
      return (
        <Field
          model={`.filters.${column.get('field')}`}
          grow="1"
          labelWidth="0px"
          onDebouncedChange={value =>
            doAsDatagrid('filter', {field: column.get('field'), value})
          }
          hintText={`Search on ${column.get('field')}`}
        />
      );
    } else {
      return <div />;
    }
  }
}

class Filters extends Form {
  constructor() {
    super(...arguments);
  }

  static connectTo(datagrid) {
    return Widget.Wired(Filters)(`${datagrid.props.id}`);
  }

  static get wiring() {
    return {
      id: 'id',
    };
  }

  render() {
    const {id, columnsNo, datagrid} = this.props;
    const self = this;
    if (!id) {
      return null;
    }

    const Form = this.Form;

    function renderFilter(index) {
      return (
        <Connect
          key={`${id}_${index}`}
          column={() => datagrid.getModelValue(`.columns[${index}]`)}
        >
          <DatagridCell
            margin="0px"
            cellUI={column => {
              return (
                <Filter
                  key={`${id}_${index}`}
                  id={id}
                  column={column}
                  doAsDatagrid={(quest, args) =>
                    self.doFor(datagrid.props.id, quest, args)
                  }
                />
              );
            }}
          />
        </Connect>
      );
    }

    return (
      <Form {...self.formConfig} className={this.props.className}>
        <Container kind="row">
          {Array.apply(null, {length: columnsNo}).map((_, i) => {
            return renderFilter(i);
          })}
        </Container>
      </Form>
    );
  }
}

class DatagridHeaders extends Form {
  constructor() {
    super(...arguments);
  }

  static get wiring() {
    return {
      id: 'id',
    };
  }

  static connectTo(instance) {
    return Widget.Wired(DatagridHeaders)(`${instance.props.id}`);
  }

  render() {
    const {id, entityUI, columnsNo, datagrid} = this.props;
    const self = this;
    if (!id) {
      return null;
    }

    const Form = this.Form;
    const DatagridFilters = Filters.connectTo(datagrid);

    function renderHeader(index) {
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
      <div>
        <Form {...self.formConfig} className={this.props.className}>
          <Container kind="row">
            {Array.apply(null, {length: columnsNo}).map((_, i) => {
              return renderHeader(i);
            })}
          </Container>
        </Form>
        <DatagridFilters
          datagrid={datagrid}
          columnsNo={columnsNo}
          className={this.props.className}
        />
      </div>
    );
  }
}

export default DatagridHeaders;
