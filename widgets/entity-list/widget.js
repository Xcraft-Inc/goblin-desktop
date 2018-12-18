import React from 'react';
import Widget from 'laboratory/widget';
import throttle from 'lodash/throttle';
import ScrollableContainer from 'gadgets/scrollable-container/widget';
import List from 'gadgets/list/widget';
import TableCell from 'gadgets/table-cell/widget';
import Button from 'gadgets/button/widget';
import EntityListItem from 'desktop/entity-list-item/widget';
import Shredder from 'xcraft-core-shredder';

const {ListHelpers} = require('goblin-toolbox');
const {getColumnProps, getColumnText} = ListHelpers;

/******************************************************************************/

class ListToolbar extends Widget {
  constructor() {
    super(...arguments);
    this.exportToCsv = this.exportToCsv.bind(this);
  }

  exportToCsv() {
    this.doAs(`${this.props.type}-list`, 'export-to-csv', {});
  }

  render() {
    const {id, exporting} = this.props;
    if (!id) {
      return null;
    }
    return (
      <div style={{marginBottom: '20px'}}>
        {exporting ? (
          <div>Export csv en cours...</div>
        ) : (
          <Button
            kind="action"
            place="1/1"
            width="300px"
            glyph="solid/save"
            text="Exporter en csv sur le disque"
            onClick={this.exportToCsv}
          />
        )}
      </div>
    );
  }
}

const Toolbar = Widget.connect((state, props) => {
  return {
    exporting: state.get(`backend.${props.id}.exporting`, false),
    type: state.get(`backend.${props.id}.type`),
  };
})(ListToolbar);

/******************************************************************************/

class EntityList extends Widget {
  constructor() {
    super(...arguments);

    this._entityIds = [];
    this._drillDownInternal = this._drillDownInternal.bind(this);
    this._drillDown = throttle(this._drillDownInternal, 100).bind(this);
    this.drillDown = this.drillDown.bind(this);
  }

  _drillDownInternal() {
    this.doAs(`${this.props.type}-list`, 'drill-down', {
      entityIds: this._entityIds,
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
      columns: 'columns',
    };
  }

  render() {
    const {id, columns} = this.props;
    if (!id) {
      return null;
    }
    const listId = `list@${id}`;
    return (
      <div className={this.styles.classNames.full}>
        <Toolbar id={id} />
        <div className={this.styles.classNames.header}>
          <TableCell isLast="false" isHeader="true" width="50px" text="n°" />
          {columns.map(c => {
            return (
              <TableCell
                key={c}
                isLast="false"
                isHeader="true"
                {...getColumnProps(c)}
                text={getColumnText(c)}
              />
            );
          })}
        </div>
        <ScrollableContainer id={listId} height="100%">
          <List
            id={listId}
            type={'uniform'}
            renderItem={EntityListItem}
            parentId={{
              onDrillDown: this.drillDown,
              onRenewTTL: this.renewTTL,
              columns: new Shredder(columns),
            }}
          />
        </ScrollableContainer>
      </div>
    );
  }
}

/******************************************************************************/

export default Widget.Wired(EntityList)();
