import React from 'react';
import Widget from 'laboratory/widget';
import ScrollableContainer from 'gadgets/scrollable-container/widget';
import List from 'gadgets/list/widget';
import TableCell from 'gadgets/table-cell/widget';
import EntityListItem from 'desktop/entity-list-item/widget';
import {getColumnProps, getColumnText} from './helpers.js';
import Shredder from 'xcraft-core-shredder';

class EntityList extends Widget {
  constructor() {
    super(...arguments);
    this.drillDown = this.drillDown.bind(this);
  }

  drillDown(entityId) {
    this.doAs(`${this.props.type}-list`, 'drill-down', {entityId});
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
    const listId = `list@${id}`;
    if (!id) {
      return null;
    }
    return (
      <div className={this.styles.classNames.full}>
        <div style={{paddingTop: '20px'}} />
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
            renderItem={EntityListItem}
            parentId={{
              onDrillDown: this.drillDown,
              columns: new Shredder(columns),
            }}
          />
        </ScrollableContainer>
      </div>
    );
  }
}

export default Widget.Wired(EntityList)();
