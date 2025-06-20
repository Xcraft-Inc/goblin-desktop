//T:2019-02-27

import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import throttle from 'lodash/throttle';
import CollectionLoader from 'goblin-laboratory/widgets/collection-loader/widget.js';
import List from 'goblin-gadgets/widgets/list/widget';
import TableCell from 'goblin-gadgets/widgets/table-cell/widget';
import TableHeaderDragManager from 'goblin-gadgets/widgets/table-header-drag-manager/widget';
import EntityListItem from 'goblin-desktop/widgets/entity-list-item/widget';
import Shredder from 'xcraft-core-shredder';
import Button from 'goblin-gadgets/widgets/button/widget';
import T from 't';
import MouseTrap from 'mousetrap';
import {Unit} from 'goblin-theme';
import ListHelpers from 'goblin-workshop/lib/list-helpers.js';

/******************************************************************************/

class EntityView extends Widget {
  constructor() {
    super(...arguments);

    this.state = {
      variant: 'bar',
    };

    this._entityIds = [];

    this._drillDownInternal = this._drillDownInternal.bind(this);
    this._drillDown = throttle(this._drillDownInternal, 100).bind(this);
    this.drillDown = this.drillDown.bind(this);
    this.selectRow = this.selectRow.bind(this);
    this.editRow = this.editRow.bind(this);
    this.onEditColumns = this.onEditColumns.bind(this);
    this.onSortColumn = this.onSortColumn.bind(this);
    this.onWidthChanged = this.onWidthChanged.bind(this);
    this.onColumnMoved = this.onColumnMoved.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyValidate = this.onKeyValidate.bind(this);
    this._setDetail = this._setDetail.bind(this);
    this.setDetail = throttle(this._setDetail, 1200);
    this.renderCollection = this.renderCollection.bind(this);
  }

  //#region get/set
  get variant() {
    return this.state.variant;
  }

  set variant(value) {
    this.setState({
      variant: value,
    });
  }
  //#endregion

  componentDidMount() {
    MouseTrap.bind('up', this.onKeyUp, 'keydown');
    MouseTrap.bind('down', this.onKeyDown, 'keydown');
    MouseTrap.bind('return', this.onKeyValidate);
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    MouseTrap.unbind('up');
    MouseTrap.unbind('down');
    MouseTrap.unbind('return');
  }

  get firstColumnWidth() {
    if (this.props.settings) {
      const userWidth = this.props.settings.get('widths.id@first-column', null);
      if (userWidth) {
        return userWidth;
      }
    }

    return '50px';
  }

  getEstimatedWidth(columns) {
    let width = ListHelpers.getEstimatedWidth(columns, this.props.settings);

    // Add left and right margins of rows.
    width = Unit.add(width, '40px');

    // Add width of first column (and his right margin).
    width = Unit.add(width, this.firstColumnWidth);
    width = Unit.add(width, '10px');

    // Add right margin after each column.
    width = Unit.add(width, Unit.multiply('10px', columns.length));

    return width;
  }

  get sorting() {
    if (this.props.settings) {
      const sorting = this.props.settings.get('sorting', null);
      if (sorting) {
        return sorting.toJS();
      }
    }

    return {
      columnId: this.props.columnIds.get(0),
      direction: 'asc',
    };
  }

  get filterPaths() {
    // TODO...
    return ['meta.summaries.description', 'meta.summaries.info'];
  }

  getEntityId(rowId) {
    const state = new Shredder(this.getState().backend);
    return state.get(`list@${this.props.id}.list.${rowId}-item`);
  }

  getEntityCount() {
    const state = new Shredder(this.getState().backend);
    return state.get(`list@${this.props.id}.count`);
  }

  getSelectedRowId() {
    const state = new Shredder(this.getState().widgets);
    return state.get(`${this.props.id}.selectedRowId`);
  }

  editRow(rowId, navigate) {
    const entityId = this.getEntityId(rowId);
    this.doFor(this.props.id, 'open-entity-workitem', {
      entityId,
      navigate,
    });
  }

  _setDetail(entityId) {
    this.doFor(this.props.id, 'setDetail', {
      entityId,
    });
  }

  selectRow(rowId) {
    if (rowId < 0 || rowId >= this.getEntityCount()) {
      return;
    }
    const entityId = this.getEntityId(rowId);
    this.dispatch({type: 'select-row', rowId, entityId});
    if (entityId && this.props.hinter) {
      this.setDetail(entityId);
    }
  }

  onKeyUp() {
    let rowId = parseInt(this.getSelectedRowId());
    if (isNaN(rowId)) {
      rowId = 1;
    }
    this.selectRow(rowId - 1);
  }

  onKeyDown() {
    let rowId = parseInt(this.getSelectedRowId());
    if (isNaN(rowId)) {
      rowId = -1;
    }
    this.selectRow(rowId + 1);
  }

  onKeyValidate() {
    const rowId = parseInt(this.getSelectedRowId());
    if (isNaN(rowId)) {
      return;
    }
    this.editRow(rowId);
  }

  onEditColumns() {
    this.doFor(this.props.id, 'open-entity-workitem', {
      entityId: `view@${this.props.type}`,
    });
  }

  _drillDownInternal() {
    let view = null;
    if (this.props.view) {
      if (this.props.view.toJS) {
        view = {view: this.props.view.toJS()};
      } else {
        view = {view: this.props.view};
      }
    }
    this.doFor(this.props.id, 'drill-down', {
      entityIds: this._entityIds,
      ...view,
    });
    this._entityIds = [];
  }

  drillDown(entityId) {
    this._entityIds.push(entityId);
    this._drillDown();
  }

  static get wiring() {
    return {
      id: 'id',
      type: 'type',
    };
  }

  onToggleBatch = () => {
    const listId = `list@${this.props.id}`;
    this.doFor(listId, 'toggle-batch-select');
  };

  onSortColumn(index, columns) {
    if (this.props.hasFilter || index === 0) {
      return;
    }

    const columnId = this.props.columnIds.get(index - 1);
    const sorting = this.sorting;
    if (sorting.columnId === columnId) {
      sorting.direction = sorting.direction === 'asc' ? 'desc' : 'asc';
    } else {
      sorting.columnId = columnId;
      sorting.direction = 'asc';
    }

    this.setUserSettings('set-view-column-sorting', {
      viewId: `view@${this.props.type}`,
      columnId: sorting.columnId,
      direction: sorting.direction,
    });

    const cell = columns.get(index - 1);
    const path = ListHelpers.getColumnPath(cell);

    this.doFor(this.props.id, 'sort-list', {
      key: path,
      dir: sorting.direction,
    });
  }

  onWidthChanged(index, width) {
    console.log(`onWidthChanged index=${index} width=${width}`);

    if (index === 0) {
      this.setUserSettings('set-view-column-width', {
        viewId: `view@${this.props.type}`,
        columnId: 'id@first-column',
        width,
      });
    } else {
      index--;
      const columnId = this.props.columnIds.get(index);
      this.setUserSettings('set-view-column-width', {
        viewId: `view@${this.props.type}`,
        columnId,
        width,
      });
    }
  }

  onColumnMoved(indexSrc, indexDst) {
    console.log(`onColumnMoved indexSrc=${indexSrc} indexDst=${indexDst}`);
    indexSrc--;
    indexDst--;

    if (indexDst > indexSrc) {
      indexDst--; // if moved from left to right, skip the initial column (indexSrc).
    }

    const c = this.props.columnIds.valueSeq().toArray();
    const srcId = c[indexSrc];
    c.splice(indexSrc, 1); // Firstly, remove the column at initial position.
    c.splice(indexDst, 0, srcId); // Secondly, insert the column at new position.

    this.setUserSettings('set-view-columns-order', {
      viewId: `view@${this.props.type}`,
      columnIds: c,
    });
  }

  /******************************************************************************/

  renderHeaderCell(cell, index) {
    let text = ListHelpers.getColumnHeaderText(cell);
    const columnId = this.props.columnIds.get(index);
    const sorting = this.sorting;
    if (sorting.columnId === columnId && !this.props.hasFilter) {
      const glyph =
        sorting.direction === 'asc' ? 'solid/caret-down' : 'solid/caret-up';
      text = new Shredder({text, glyph});
    }

    return (
      <TableCell
        key={index}
        isLast={false}
        isHeader={true}
        verticalAlign="center"
        {...ListHelpers.getColumnProps(cell, this.props.settings)}
        text={text}
      />
    );
  }

  renderHeader(columns) {
    const columnsData = [];
    let index = 0;
    columnsData.push({index: index++, width: this.firstColumnWidth});
    for (const column of columns) {
      const props = ListHelpers.getColumnProps(column, this.props.settings);
      columnsData.push({index: index++, width: props.width});
    }

    return (
      <div
        className={
          this.props.hasFilter
            ? this.styles.classNames.headerFilter
            : this.styles.classNames.header
        }
      >
        <TableCell
          isLast={false}
          isHeader={true}
          verticalAlign="center"
          width={this.firstColumnWidth}
          text={T('N°')}
        />
        {columns.map((c, i) => this.renderHeaderCell(c, i))}
        <TableHeaderDragManager
          height="44px"
          marginLeft="20px"
          columns={columnsData}
          fixedColumns={[0]}
          widthChanged={(index, width) => this.onWidthChanged(index, width)}
          columnMoved={(src, dst) => this.onColumnMoved(src, dst)}
          columnClicked={(index) => this.onSortColumn(index, columns)}
        />
      </div>
    );
  }

  renderRows(columns) {
    const listId = `list@${this.props.id}`;

    return (
      <div className={this.styles.classNames.rows}>
        <List
          id={listId}
          type={'variable'}
          renderItem={EntityListItem}
          data={{
            firstColumnWidth: this.firstColumnWidth,
            filterPaths: this.filterPaths,
            hasFilter: this.props.hasFilter,
            onDrillDown: this.drillDown,
            onRenewTTL: this.renewTTL,
            columns: columns,
            settings: this.props.settings,
            onSelect: this.selectRow,
            onEdit: this.editRow,
            useView: this.props.view ? true : false,
            serviceId: this.props.id,
            variant: this.variant,
            schema: this.getSchema(this.props.type),
          }}
        />
      </div>
    );
  }

  renderButton() {
    if (!this.props.prototypeMode) {
      return null;
    }

    return (
      <div className={this.styles.classNames.button}>
        <Button
          width="30px"
          height="30px"
          glyph="solid/columns"
          tooltip={T('Choisir les colonnes')}
          onClick={this.onEditColumns}
        />
        <Button
          width="30px"
          height="30px"
          glyph="solid/check"
          tooltip={T('Activer / Désactiver la séléction en lots')}
          onClick={this.onToggleBatch}
        />
      </div>
    );
  }

  renderVariants() {
    if (!this.props.prototypeMode) {
      return null;
    }

    return (
      <div className={this.styles.classNames.variants}>
        <Button
          width="28px"
          height="20px"
          fontSize="75%"
          text="J"
          tooltip={T('Jauge verticale')}
          horizontalSpacing="overlap"
          active={this.variant === 'gauge'}
          onClick={() => (this.variant = 'gauge')}
        />
        <Button
          width="28px"
          height="20px"
          fontSize="75%"
          text="B"
          tooltip={T('Barre verticale')}
          horizontalSpacing="overlap"
          active={this.variant === 'bar'}
          onClick={() => (this.variant = 'bar')}
        />
        <Button
          width="28px"
          height="20px"
          fontSize="75%"
          text="C"
          tooltip={T('Carnaval')}
          horizontalSpacing="overlap"
          active={this.variant === 'carnaval'}
          onClick={() => (this.variant = 'carnaval')}
        />
      </div>
    );
  }

  renderCollection(columns) {
    const width = this.getEstimatedWidth(columns);
    const widthStyle = {
      minWidth: width,
    };

    return (
      <div className={this.styles.classNames.entityView}>
        <div className={this.styles.classNames.list}>
          <div className={this.styles.classNames.content} style={widthStyle}>
            {this.renderHeader(columns)}
            {this.renderRows(columns)}
          </div>
        </div>
        {this.renderButton(columns)}
        {this.renderVariants(columns)}
      </div>
    );
  }

  render() {
    const {id, columnIds, isBad, type} = this.props;
    if (!id || !columnIds) {
      return null;
    }

    if (isBad) {
      this.setUserSettings('reset-view-column', {
        viewId: `view@${type}`,
      });
      return null;
    }

    return (
      <CollectionLoader ids={columnIds} returnCollection={true}>
        {(collection) => this.renderCollection(collection)}
      </CollectionLoader>
    );
  }
}

/******************************************************************************/

const ConnectedEntityView = Widget.connect((state, props) => {
  if (!props.type) {
    return {};
  }

  const hasFilter = !!state.get(`widgets.${props.id}.value`, null);

  const view = state.get(`backend.view@${props.type}`);
  let columnIds = view.get('columns');

  const clientSessionId = state.get(`backend.${window.labId}.clientSessionId`);
  const userView = state.get(
    `backend.${clientSessionId}.views.view@${props.type}`
  );
  let isBad = false;
  if (userView) {
    const order = userView.get('order');
    if (order.size > 0) {
      isBad = order.some((id) => !columnIds.includes(id));
      if (!isBad) {
        columnIds = order;
      }
    }
  }

  const userSession = Widget.getUserSession(state);
  const prototypeMode = userSession.get('prototypeMode');

  return {
    isBad,
    hasFilter,
    columnIds,
    view: view.get('query'),
    settings: userView,
    prototypeMode,
  };
})(EntityView);

export default Widget.Wired(ConnectedEntityView);
