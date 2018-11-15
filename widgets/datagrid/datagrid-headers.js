import React from 'react';
import Widget from 'laboratory/widget';
import Form from 'laboratory/form';
import Container from 'gadgets/container/widget';
import Label from 'gadgets/label/widget';
import Field from 'gadgets/field/widget';
import DatagridCell from '../datagrid-cell/widget';
import _ from 'lodash';

const LabelConnected = Widget.connect((state, props) => {
  const key = state.get(`backend.${props.id}.sort.key`);
  const dir = state.get(`backend.${props.id}.sort.dir`);

  let glyph = 'solid/sort';
  let tooltip = null;

  if (key === props.column.get('field')) {
    if (dir === 'asc') {
      glyph = 'solid/sort-alpha-up';
      tooltip = props.tooltips.asc;
    } else {
      glyph = 'solid/sort-alpha-down';
      tooltip = props.tooltips.desc;
    }
  }

  return {glyph: glyph, tooltip: tooltip};
})(Label);

class Header extends Widget {
  constructor() {
    super(...arguments);
    this.tooltips = {
      asc: this.T('ascending order'),
      desc: this.T('descending order'),
    };

    this.renderSortingHeader = this.renderSortingHeader.bind(this);
    this.renderComponent = this.renderComponent.bind(this);
  }

  renderSortingHeader() {
    return (
      <LabelConnected
        tooltips={this.tooltips}
        id={this.props.datagrid.props.id}
        column={this.props.column}
        onClick={() =>
          this.props.doAsDatagrid('toggle-sort', {
            field: this.props.column.get('field'),
          })
        }
        spacing="overlap"
      />
    );
  }

  renderComponent() {
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

    const CellUI = component.WithState(headerCell, 'id')('.id');

    return (
      <DatagridCell
        id={datagrid.props.id}
        index={index}
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

  render() {
    const {index, column, datagrid} = this.props;

    if (column.get('sortable')) {
      return (
        <DatagridCell
          id={datagrid.props.id}
          index={index}
          column={column}
          margin="0px"
          cellUI={_ => {
            return (
              <Container kind="row" width={column.get('width')}>
                {this.renderComponent()}
                {this.renderSortingHeader()}
              </Container>
            );
          }}
        />
      );
    } else {
      return this.renderComponent();
    }
  }
}

const HeaderConnected = Widget.connect((state, props) => {
  return {
    column: state.get(`backend.${props.id}.columns[${props.index}]`),
  };
})(Header);

class Filter extends Widget {
  render() {
    const {
      column,
      doAsDatagrid,
      entityUI,
      datagrid,
      id,
      index,
      component,
    } = this.props;

    if (column.get('customFilter') && entityUI && entityUI.filterCell) {
      const CellUI = component.WithState(entityUI.filterCell, 'id')('.id');

      return (
        <DatagridCell
          id={datagrid.props.id}
          index={index}
          cellUI={column => {
            return (
              <CellUI
                key={`${id}_${index}`}
                id={id}
                index={index}
                theme={this.context.theme}
                column={column}
                datagrid={datagrid}
                doAsDatagrid={doAsDatagrid}
                contextId={this.context.contextId}
              />
            );
          }}
          column={column}
        />
      );
    } else if (column.get('field') && column.get('filterable')) {
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

    this.renderFilter = this.renderFilter.bind(this);
  }

  static connectTo(datagrid) {
    return Widget.Wired(Filters)(`${datagrid.props.id}`);
  }

  static get wiring() {
    return {
      id: 'id',
    };
  }

  renderFilter(index) {
    const {id, datagrid, entityUI, component} = this.props;

    return (
      <DatagridCell
        key={`${id}_${index}`}
        id={datagrid.props.id}
        index={index}
        margin="0px"
        cellUI={column => {
          return (
            <Filter
              key={`${id}_${index}`}
              id={id}
              index={index}
              component={component}
              datagrid={datagrid}
              entityUI={entityUI}
              column={column}
              doAsDatagrid={(quest, args) =>
                this.doFor(datagrid.props.id, quest, args)
              }
            />
          );
        }}
      />
    );
  }

  render() {
    const {id, columnsNo} = this.props;
    const self = this;
    if (!id) {
      return null;
    }

    const Form = this.Form;

    return (
      <Form {...self.formConfig} className={this.props.className}>
        <Container kind="row">
          {Array.apply(null, {length: columnsNo}).map((_, i) => {
            return this.renderFilter(i);
          })}
        </Container>
      </Form>
    );
  }
}

class DatagridHeaders extends Form {
  constructor() {
    super(...arguments);

    this.renderHeader = this.renderHeader.bind(this);
  }

  static get wiring() {
    return {
      id: 'id',
    };
  }

  static connectTo(instance) {
    return Widget.Wired(DatagridHeaders)(`${instance.props.id}`);
  }

  renderHeader(index) {
    const {entityUI, datagrid, id} = this.props;

    if (entityUI && entityUI.headerCell) {
      return (
        <HeaderConnected
          key={`${id}_${index}`}
          id={id}
          index={index}
          datagrid={datagrid}
          doAsDatagrid={(quest, args) =>
            this.doFor(datagrid.props.id, quest, args)
          }
          component={this}
          headerCell={entityUI.headerCell}
          context={this.context}
        />
      );
    }
  }

  render() {
    const {id, columnsNo, datagrid, entityUI} = this.props;
    const self = this;
    if (!id) {
      return null;
    }

    const Form = this.Form;
    const DatagridFilters = Filters.connectTo(datagrid);

    return (
      <div>
        <Form {...self.formConfig} className={this.props.className}>
          <Container kind="row">
            {Array.apply(null, {length: columnsNo}).map((_, i) => {
              return this.renderHeader(i);
            })}
          </Container>
        </Form>
        <DatagridFilters
          component={this}
          entityUI={entityUI}
          datagrid={datagrid}
          columnsNo={columnsNo}
          className={this.props.className}
        />
      </div>
    );
  }
}

export default DatagridHeaders;
