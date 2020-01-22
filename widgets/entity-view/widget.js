//T:2019-02-27

import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import throttle from 'lodash/throttle';
import List from 'goblin-gadgets/widgets/list/widget';
import TableCell from 'goblin-gadgets/widgets/table-cell/widget';
import EntityListItem from 'goblin-desktop/widgets/entity-list-item/widget';
import Shredder from 'xcraft-core-shredder';
import Button from 'goblin-gadgets/widgets/button/widget';
import T from 't';

import {ListHelpers} from 'goblin-toolbox';
const {getEstimatedWidth, getColumnProps, getColumnText} = ListHelpers;

/******************************************************************************/

class EntityView extends Widget {
  constructor() {
    super(...arguments);

    this._entityIds = [];
    this._drillDownInternal = this._drillDownInternal.bind(this);
    this._drillDown = throttle(this._drillDownInternal, 100).bind(this);
    this.drillDown = this.drillDown.bind(this);
    this.selectRow = this.selectRow.bind(this);
    this.editRow = this.editRow.bind(this);
    this.prevRow = this.prevRow.bind(this);
    this.nextRow = this.nextRow.bind(this);
    this.onEditColumns = this.onEditColumns.bind(this);
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
    this.dispatch({type: 'select-row', rowId});
    const entityId = this.getEntityId(rowId);
    if (this.props.hinter) {
      this.navToDetail(this.props.id, entityId, this.props.hinter);
    }
  }

  get selectedIndex() {
    return this.getBackendValue(`backend.${this.props.id}.selectedIndex`);
  }

  prevRow() {
    //
  }

  nextRow() {
    //
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

  renderHeader(columns) {
    return (
      <div className={this.styles.classNames.header}>
        <TableCell isLast="false" isHeader="true" width="60px" text="N°" />
        {columns.map((c, i) => {
          let defaultProps = {width: '100px', wrap: 'no'};
          if (i === 0) {
            defaultProps = {grow: '1', wrap: 'no'};
          }
          return (
            <TableCell
              key={i}
              isLast="false"
              isHeader="true"
              {...defaultProps}
              {...getColumnProps(c)}
              text={getColumnText(c)}
            />
          );
        })}
      </div>
    );
  }

  renderRows(columns) {
    const listId = `list@${this.props.id}`;

    return (
      <div className={this.styles.classNames.rows}>
        <List
          id={listId}
          type={'uniform'}
          renderItem={EntityListItem}
          data={{
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
          border="none"
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
const ConnectedEntityView = Widget.connect((state, prop) => {
  if (!prop.type) {
    return {};
  }
  const view = state.get(`backend.view@${prop.type}`);
  return {columns: view.get('columns'), view: view.get('query')};
})(EntityView);

/******************************************************************************/

export default Widget.Wired(ConnectedEntityView)();
