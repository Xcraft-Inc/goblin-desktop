import React from 'react';
import Widget from 'laboratory/widget';
import TableCell from 'gadgets/table-cell/widget';
import {
  getColumnProps,
  getColumnTargetPath,
  getColumnSubPath,
  getColumnPath,
} from '../entity-list/helpers.js';

import Shredder from 'xcraft-core-shredder';
class _Driller extends Widget {
  constructor() {
    super(...arguments);
    this._loadRequested = false;
  }

  render() {
    if (this.props.loaded) {
      return (
        <TableCell
          isLast="false"
          isHeader="false"
          text={this.props.text}
          {...getColumnProps(this.props.column)}
        />
      );
    } else {
      if (this._loadRequested === false) {
        setTimeout(this.props.onDrillDown, 0, this.props.entityId);
        this._loadRequested = true;
      }
      return (
        <TableCell
          grow="1"
          isLast="false"
          isHeader="false"
          text="chargement..."
        />
      );
    }
  }
}

const Driller = Widget.connect((state, props) => {
  const loaded = !!state.get(`backend.${props.entityId}.id`, null);
  const path = props.path || 'meta.summaries.info';
  return {
    column: props.column,
    entityId: props.entityId,
    loaded: loaded,
    text: loaded ? state.get(`backend.${props.entityId}.${path}`) : '',
  };
})(_Driller);

class EntityRow extends Widget {
  constructor() {
    super(...arguments);
    this._idRequested = null;
  }

  render() {
    const {id, rowIndex, entity, columns} = this.props;
    const loaded = id && entity;
    const rowStyle = {
      height: this.props.height,
      borderTop: '1px solid #aaa',
      display: 'flex',
      flexDirection: 'row',
      padding: '5px 1px 5px 1px',
      backgroundColor: rowIndex % 2 === 0 ? '#eee' : 'white',
      cursor: 'default',
    };

    if (!loaded) {
      if (this._idRequested !== id) {
        setTimeout(this.props.onDrillDown, 0, id);
        this._idRequested = id;
      }
      return <div style={rowStyle} />;
    }

    return (
      <div style={rowStyle}>
        <TableCell
          rowId={rowIndex}
          key={rowIndex}
          index={rowIndex}
          isLast="false"
          isHeader="false"
          width="50px"
          wrap="no-end"
          text={
            new Shredder({
              text: rowIndex + 1,
              weight: 'bold',
            })
          }
        />
        {columns.map((c, i) => {
          const columnPath = getColumnPath(c);
          const targetPath = getColumnTargetPath(c);
          const columnSubPath = getColumnSubPath(c);
          let text = entity.get(columnPath, null);
          if (
            ((entity.get('meta.references') &&
              entity.get('meta.references').has(targetPath)) ||
              (entity.get('meta.values') &&
                entity.get('meta.values').has(targetPath))) &&
            text !== null
          ) {
            return (
              <Driller
                entityId={text}
                rowId={i}
                key={i}
                column={c}
                onDrillDown={this.props.onDrillDown}
                path={columnSubPath}
              />
            );
          } else {
            return (
              <TableCell
                rowId={i}
                key={i}
                index={i}
                isLast="false"
                isHeader="false"
                {...getColumnProps(c)}
                text={text}
              />
            );
          }
        })}
      </div>
    );
  }
}

export default Widget.connect((state, props) => {
  return {
    id: props.id,
    entity: state.get(`backend.${props.id}`),
  };
})(EntityRow);
