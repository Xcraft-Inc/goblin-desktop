import React from 'react';
import Widget from 'laboratory/widget';
import TableCell from 'gadgets/table-cell/widget';

const {ListHelpers} = require('goblin-toolbox');
const {
  getColumnProps,
  getColumnTargetPath,
  getColumnSubPath,
  getColumnPath,
  getColumnType,
  isTargetingValueOrRef,
} = ListHelpers;

import Shredder from 'xcraft-core-shredder';

import {
  date as DateConverters,
  price as PriceConverters,
} from 'xcraft-core-converters';

/******************************************************************************/

function getColumnText(c, entity) {
  const columnPath = getColumnPath(c);
  const text = entity.get(columnPath, null);
  switch (getColumnType(c)) {
    case 'date':
      if (text && text.length > 0 && text[0] >= '0' && text[0] <= '9') {
        // Canonical date "yyyy-mm-dd" ?
        return DateConverters.getDisplayed(text);
      }
      break;
    case 'price':
      if (text && text.length > 0 && text[0] >= '0' && text[0] <= '9') {
        // Numeric price ?
        return PriceConverters.getDisplayed(text);
      }
      break;
  }
  return text;
}

/******************************************************************************/

class _Driller extends Widget {
  constructor() {
    super(...arguments);
    this.renewTTL = this.renewTTL.bind(this);
    this._loadRequested = false;
    this._renewInterval = null;
  }

  renewTTL(id) {
    if (this._renewInterval) {
      clearInterval(this._renewInterval);
    }
    this._renewInterval = setInterval(this.props.onDrillDown, 15000, id);
  }

  componentWillUnmount() {
    clearInterval(this._renewInterval);
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
        this.renewTTL(this.props.entityId);
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

/******************************************************************************/

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

/******************************************************************************/

class EntityRow extends Widget {
  constructor() {
    super(...arguments);
    this.renewTTL = this.renewTTL.bind(this);
    this._idRequested = null;
    this._renewInterval = null;
  }

  renewTTL(id) {
    if (this._renewInterval) {
      clearInterval(this._renewInterval);
    }
    this._renewInterval = setInterval(this.props.onDrillDown, 15000, id);
  }

  componentWillUnmount() {
    clearInterval(this._renewInterval);
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
        this.renewTTL(id);
        this._idRequested = id;
      }
      return (
        <div style={rowStyle}>
          <TableCell
            grow="1"
            isLast="false"
            isHeader="false"
            textAlign="center"
            text="Chargement..."
          />
        </div>
      );
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
          const targetPath = getColumnTargetPath(c);
          const columnSubPath = getColumnSubPath(c);
          const text = getColumnText(c, entity);
          if (isTargetingValueOrRef(entity, targetPath) && text !== null) {
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

/******************************************************************************/

export default Widget.connect((state, props) => {
  return {
    id: props.id,
    entity: state.get(`backend.${props.id}`),
  };
})(EntityRow);
