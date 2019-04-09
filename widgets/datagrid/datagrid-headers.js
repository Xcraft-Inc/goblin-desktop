//T:2019-02-27

import React from 'react';
import Widget from 'laboratory/widget';
import Form from 'laboratory/form';
import Container from 'gadgets/container/widget';
import Label from 'gadgets/label/widget';
import DatagridCell from '../datagrid-cell/widget';
import T from 't';

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
      asc: T('ascending order'),
      desc: T('descending order'),
    };

    this.renderSortingHeader = this.renderSortingHeader.bind(this);
    this.renderComponent = this.renderComponent.bind(this);
    this.renderComponentCellUI = this.renderComponentCellUI.bind(this);
    this.renderCustomSortCellUI = this.renderCustomSortCellUI.bind(this);
    this.renderSortableCellUI = this.renderSortableCellUI.bind(this);
  }

  renderSortingHeader() {
    return (
      <LabelConnected
        tooltips={this.tooltips}
        id={this.props.datagridId}
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

  renderComponentCellUI(column, index) {
    const {
      id,
      datagridId,
      doAsDatagrid,
      context,
      component,
      headerCell,
    } = this.props;

    const CellUI = component.WithState(headerCell, 'id')('.id');
    return (
      <CellUI
        key={`${id}_${index}`}
        id={id}
        index={index}
        theme={context.theme}
        column={column}
        datagridId={datagridId}
        doAsDatagrid={doAsDatagrid}
        contextId={context.contextId}
      />
    );
  }

  renderComponent() {
    const {column, index, datagridId} = this.props;

    return (
      <DatagridCell
        id={datagridId}
        index={index}
        cellUI={this.renderComponentCellUI}
        column={column}
      />
    );
  }

  renderCustomSortCellUI(column, index) {
    const {datagridId, component, entityUI, id, doAsDatagrid} = this.props;

    const CellUI = component.WithState(entityUI.sortCell, 'id')('.id');
    return (
      <Container kind="row" width={column.get('width')}>
        {this.renderComponent()}
        <CellUI
          key={`${id}_${index}`}
          id={id}
          index={index}
          theme={this.context.theme}
          column={column}
          datagridId={datagridId}
          doAsDatagrid={doAsDatagrid}
          contextId={this.context.contextId}
        />
      </Container>
    );
  }

  renderSortableCellUI(column) {
    return (
      <Container kind="row" width={column.get('width')}>
        {this.renderComponent()}
        {this.renderSortingHeader()}
      </Container>
    );
  }

  render() {
    const {index, column, datagridId} = this.props;

    if (column.get('customSort')) {
      return (
        <DatagridCell
          id={datagridId}
          index={index}
          column={column}
          margin="0px"
          cellUI={this.renderCustomSortCellUI}
        />
      );
    } else if (column.get('sortable')) {
      return (
        <DatagridCell
          id={datagridId}
          index={index}
          column={column}
          margin="0px"
          cellUI={this.renderSortableCellUI}
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

class Hinter extends Widget {
  constructor() {
    super(...arguments);
  }

  static connectTo(datagridId) {
    return Widget.Wired(Hinter)(`${datagridId}`);
  }

  static get wiring() {
    return {
      id: 'id',
    };
  }

  render() {
    const {id, entityUI, component, datagridId} = this.props;
    if (!id) {
      return null;
    }

    const CellUI = component.WithState(entityUI.hinter, 'id')('.id');

    return (
      <CellUI
        key={`${id}`}
        id={id}
        theme={this.context.theme}
        contextId={this.context.contextId}
        datagridId={datagridId}
        doAsDatagrid={(quest, args) => this.doFor(datagridId, quest, args)}
      />
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
    const {entityUI, datagridId, id} = this.props;

    if (entityUI && entityUI.headerCell) {
      return (
        <HeaderConnected
          key={`${id}_${index}`}
          id={id}
          index={index}
          datagridId={datagridId}
          doAsDatagrid={(quest, args) => this.doFor(datagridId, quest, args)}
          component={this}
          headerCell={entityUI.headerCell}
          context={this.context}
          entityUI={entityUI}
        />
      );
    }
  }

  render() {
    const {id, columnsNo, datagridId, entityUI} = this.props;
    const self = this;
    if (!id) {
      return null;
    }

    const Form = this.Form;
    const DatagridHinter = Hinter.connectTo(datagridId);

    return (
      <div>
        <Form {...self.formConfig} className={this.props.className}>
          <Container kind="row">
            {Array.apply(null, {length: columnsNo}).map((_, i) => {
              return this.renderHeader(i);
            })}
          </Container>
        </Form>
        <DatagridHinter
          component={this}
          entityUI={entityUI}
          datagridId={datagridId}
          columnsNo={columnsNo}
          className={this.props.className}
        />
      </div>
    );
  }
}

export default DatagridHeaders;
