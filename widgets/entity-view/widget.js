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

    this.state = {
      firstColumnWidth: '50px',
      sortingColumn: {index: 0, direction: 'down'},
    };

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

  //#region get/set
  get firstColumnWidth() {
    return this.state.firstColumnWidth;
  }

  set firstColumnWidth(value) {
    this.setState({
      firstColumnWidth: value,
    });
  }

  get sortingColumn() {
    return this.state.sortingColumn;
  }

  set sortingColumn(value) {
    this.setState({
      sortingColumn: value,
    });
  }
  //#endregion

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

  sortList(key, dir) {
    this.doFor(this.props.id, 'sort-list', {
      key,
      dir,
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

  //- get selectedIndex() {
  //-   return this.getBackendValue(`backend.${this.props.id}.selectedIndex`);
  //- }

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

  onSortColumn(index, path) {
    const x = this.sortingColumn;

    if (x.index === index) {
      this.sortingColumn = {
        index: x.index,
        direction: x.direction === 'down' ? 'up' : 'down',
      };
      this.sortList(path, x.direction === 'down' ? 'asc' : 'desc');
    } else {
      this.sortingColumn = {
        index: index,
        direction: 'down',
      };
      this.sortList(path, 'desc');
    }
  }

  onWidthChanged(index, width) {
    console.log(`onWidthChanged index=${index} width=${width}`);
    if (index === 0) {
      this.firstColumnWidth = width;
    } else {
      // TODO
    }
  }

  /******************************************************************************/

  renderHeaderCell(cell, index) {
    let text = getColumnHeaderText(cell);
    if (this.sortingColumn.index === index) {
      const glyph =
        this.sortingColumn.direction === 'down'
          ? 'solid/caret-down'
          : 'solid/caret-up';
      text = new Shredder({text, glyph});
    }

    return (
      <TableCell
        key={index}
        isLast="false"
        isHeader="true"
        {...getColumnProps(cell, index === 0)}
        text={text}
        selectionChanged={() => this.onSortColumn(index, getColumnPath(cell))}
      />
    );
  }

  renderHeader(columns) {
    const columnsData = [];
    let index = 0;
    columnsData.push({index: index++, width: this.firstColumnWidth});
    for (const column of columns) {
      const props = getColumnProps(column, false);
      columnsData.push({index: index++, width: props.width});
    }

    return (
      <div className={this.styles.classNames.header}>
        <TableCell
          isLast="false"
          isHeader="true"
          width={this.firstColumnWidth}
          text={T('N°')}
        />
        {columns.map((c, i) => this.renderHeaderCell(c, i))}
        <TableHeaderDragManager
          marginLeft="20px"
          columns={columnsData}
          widthChanged={(index, width) => this.onWidthChanged(index, width)}
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
    const {id, columns} = this.props;
    if (!id || !columns) {
      return null;
    }

    return this.buildCollectionLoader(
      columns.toArray(),
      ({collection}) => {
        const columns = collection;
        const width = getEstimatedWidth(columns);
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
  return {columns: view.get('columns'), view: view.get('query')};
})(EntityView);

export default Widget.Wired(ConnectedEntityView)();
