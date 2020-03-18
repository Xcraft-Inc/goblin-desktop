//T:2019-02-27

import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import throttle from 'lodash/throttle';
import List from 'goblin-gadgets/widgets/list/widget';
import TableCell from 'goblin-gadgets/widgets/table-cell/widget';
import TableHeaderDragManager from 'goblin-gadgets/widgets/table-header-drag-manager/widget';
import EntityListItem from 'goblin-desktop/widgets/entity-list-item/widget';
import Shredder from 'xcraft-core-shredder';
import Button from 'goblin-gadgets/widgets/button/widget';
import T from 't';
import MouseTrap from 'mousetrap';

import {ListHelpers} from 'goblin-toolbox';
const {
  getEstimatedWidth,
  getColumnProps,
  getColumnPath,
  getColumnHeaderText,
} = ListHelpers;

/******************************************************************************/

class EntityView extends Widget {
  constructor() {
    super(...arguments);

    this._entityIds = [];
    this.selectedRowId = null; // TODO: Make better!

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
  }

  componentWillMount() {
    MouseTrap.bind('up', this.onKeyUp, 'keydown');
    MouseTrap.bind('down', this.onKeyDown, 'keydown');
    MouseTrap.bind('return', this.onKeyValidate);
    MouseTrap.bind('tab', this.onKeyValidate);
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    MouseTrap.unbind('up');
    MouseTrap.unbind('down');
    MouseTrap.unbind('return');
    MouseTrap.unbind('tab');
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

  get sorting() {
    if (this.props.settings) {
      const sorting = this.props.settings.get('sorting', null);
      if (sorting) {
        return sorting.toJS();
      }
    }

    return {
      columnId: this.props.columns.get(0),
      direction: 'asc',
    };
  }

  getEntityId(rowId) {
    const state = new Shredder(this.getState().backend);
    return state.get(`list@${this.props.id}.list.${rowId}-item`);
  }

  editRow(rowId, navigate) {
    const entityId = this.getEntityId(rowId);
    this.doFor(this.props.id, 'open-entity-workitem', {
      entityId,
      navigate,
    });
  }

  selectRow(rowId) {
    console.log(`EntityView.selectRow rowId='${rowId}'`);
    this.selectedRowId = rowId;
    this.dispatch({type: 'select-row', rowId});
    const entityId = this.getEntityId(rowId);
    if (this.props.hinter) {
      this.navToDetail(this.props.id, entityId, this.props.hinter);
    }
  }

  onEditColumns() {
    this.doFor(this.props.id, 'open-entity-workitem', {
      entityId: `view@${this.props.type}`,
    });
  }

  onKeyUp() {
    // TODO: Make better!
    const rowId = parseInt(this.selectedRowId);
    if (isNaN(rowId)) {
      return;
    }
    this.selectRow(rowId - 1);
  }

  onKeyDown() {
    // TODO: Make better!
    const rowId = parseInt(this.selectedRowId);
    if (isNaN(rowId)) {
      return;
    }
    this.selectRow(rowId + 1);
  }

  onKeyValidate() {
    // TODO: Make better!
    const rowId = parseInt(this.selectedRowId);
    if (isNaN(rowId)) {
      return;
    }
    this.editRow(rowId);
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

  sortList(key, dir) {
    this.doFor(this.props.id, 'sort-list', {
      key,
      dir,
    });
  }

  onSortColumn(index) {
    const columnId = this.props.columns.get(index - 1);
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

    const path = getColumnPath(columnId);
    this.sortList(path, sorting.direction);
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
      const columnId = this.props.columns.get(index);
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

    const c = this.props.columns.toArray();
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
    let text = getColumnHeaderText(cell);
    const columnId = this.props.columns.get(index);
    const sorting = this.sorting;
    if (sorting.columnId === columnId) {
      const glyph =
        sorting.direction === 'asc' ? 'solid/caret-down' : 'solid/caret-up';
      text = new Shredder({text, glyph});
    }

    return (
      <TableCell
        key={index}
        isLast="false"
        isHeader="true"
        verticalAlign="center"
        {...getColumnProps(cell, index === 0, this.props.settings)}
        text={text}
      />
    );
  }

  renderHeader(columns) {
    const columnsData = [];
    let index = 0;
    columnsData.push({index: index++, width: this.firstColumnWidth});
    for (const column of columns) {
      const props = getColumnProps(column, false, this.props.settings);
      columnsData.push({index: index++, width: props.width});
    }

    return (
      <div className={this.styles.classNames.header}>
        <TableCell
          isLast="false"
          isHeader="true"
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
          columnClicked={index => this.onSortColumn(index)}
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
            onDrillDown: this.drillDown,
            onRenewTTL: this.renewTTL,
            columns: columns,
            settings: this.props.settings,
            onSelect: this.selectRow,
            onEdit: this.editRow,
            useView: this.props.view ? true : false,
            serviceId: this.props.id,
          }}
        />
      </div>
    );
  }

  renderButton() {
    return (
      <div className={this.styles.classNames.button}>
        <Button
          width="30px"
          height="30px"
          glyph="solid/columns"
          tooltip={T('Choisir les colonnes')}
          onClick={this.onEditColumns}
        />
      </div>
    );
  }

  render() {
    const {id, columns, type} = this.props;
    if (!id || !columns) {
      return null;
    }

    return this.buildCollectionLoader(
      columns.toArray(),
      ({collection}) => {
        const columns = collection;
        const width = getEstimatedWidth(columns, this.props.settings);
        const widthStyle = {
          minWidth: width,
        };

        return (
          <div className={this.styles.classNames.entityView}>
            <div className={this.styles.classNames.list}>
              <div
                className={this.styles.classNames.content}
                style={widthStyle}
              >
                {this.renderHeader(columns)}
                {this.renderRows(columns)}
              </div>
            </div>
            {this.renderButton(columns)}
          </div>
        );
      },
      null
    );
  }
}

/******************************************************************************/

const ConnectedEntityView = Widget.connect((state, prop) => {
  if (!prop.type) {
    return {};
  }
  const view = state.get(`backend.view@${prop.type}`);
  let columns = view.get('columns');

  const clientSessionId = state.get(`backend.${window.labId}.clientSessionId`);
  const userView = state.get(
    `backend.${clientSessionId}.views.view@${prop.type}`
  );
  if (userView) {
    const order = userView.get('order');
    if (order.size > 0) {
      //todo clean non available
      columns = order;
    }
  }
  return {columns, view: view.get('query'), settings: userView};
})(EntityView);

export default Widget.Wired(ConnectedEntityView)();
