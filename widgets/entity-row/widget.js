//T:2019-02-27
import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import TableCell from 'goblin-gadgets/widgets/table-cell/widget';
import EntityRowButton from 'goblin-desktop/widgets/entity-row-button/widget';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import T from 't';

import {ListHelpers} from 'goblin-toolbox';
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
  time as TimeConverters,
  price as PriceConverters,
} from 'xcraft-core-converters';

/******************************************************************************/

function getColumnText(c, entity) {
  const columnPath = getColumnPath(c);
  const text = columnPath && entity.get(columnPath, null);
  switch (getColumnType(c)) {
    case 'date':
      if (text && text.length > 0 && text[0] >= '0' && text[0] <= '9') {
        // Canonical date "yyyy-mm-dd" ?
        return DateConverters.getDisplayed(text);
      }
      break;
    case 'time':
      if (text && text.length > 0 && text[0] >= '0' && text[0] <= '9') {
        // Canonical time "00:00:00" ?
        return TimeConverters.getDisplayed(text);
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
    super.componentWillUnmount();
    clearInterval(this._renewInterval);
  }

  render() {
    if (this._loadRequested === false) {
      setTimeout(this.props.onDrillDown, 0, this.props.entityId);
      this.renewTTL(this.props.entityId);
      this._loadRequested = true;
    }

    if (this.props.loaded) {
      return (
        <TableCell
          rowId={this.props.rowId}
          isLast="false"
          isHeader="false"
          text={this.props.text}
          {...getColumnProps(this.props.column)}
          selectionChanged={this.props.onSelect}
        />
      );
    } else {
      return (
        <TableCell
          rowId={this.props.rowId}
          isLast="false"
          isHeader="false"
          {...getColumnProps(this.props.column)}
        >
          <FontAwesomeIcon icon={[`fas`, 'spinner']} size={'1x'} pulse />
        </TableCell>
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
    this.onEditInStash = this.onEditInStash.bind(this);
    this.onEditAndOpen = this.onEditAndOpen.bind(this);
    this._idRequested = null;
    this._renewInterval = null;
  }

  renewTTL(id) {
    if (this._renewInterval) {
      clearInterval(this._renewInterval);
    }
    this._renewInterval = setInterval(this.props.onDrillDown, 15000, id);
  }

  onEditInStash() {
    this.props.onEdit(this.props.rowIndex, false);
  }

  onEditAndOpen() {
    this.props.onEdit(this.props.rowIndex, true);
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    clearInterval(this._renewInterval);
  }

  renderButtons() {
    return (
      <div className={`buttons-hover ${this.styles.classNames.buttons}`}>
        <EntityRowButton
          place="left"
          glyph="solid/external-link"
          tooltip={T('Editer plus tard')}
          onClick={this.onEditInStash}
        />
        <EntityRowButton
          place="right"
          glyph="solid/pencil"
          tooltip={T('Editer immédiatement')}
          onClick={this.onEditAndOpen}
        />
      </div>
    );
  }

  render() {
    const {id, rowIndex, entity, columns, onDrillDown} = this.props;
    const loaded = id && entity;

    if (onDrillDown && id && this._idRequested !== id) {
      setTimeout(onDrillDown, 0, id);
      this.renewTTL(id);
      this._idRequested = id;
    }

    if (!loaded) {
      return (
        <div className={this.styles.classNames.entityRow}>
          <TableCell grow="1" isLast="false" isHeader="false">
            <FontAwesomeIcon icon={[`fas`, 'spinner']} size={'1x'} pulse />
          </TableCell>
        </div>
      );
    }

    return (
      <div className={this.styles.classNames.entityRow}>
        <TableCell
          rowId={rowIndex}
          key={rowIndex}
          index={rowIndex}
          isLast="false"
          isHeader="false"
          width="40px"
          wrap="no-end"
          text={
            new Shredder({
              text: rowIndex + 1,
              weight: 'bold',
            })
          }
        />
        {columns.map((c, i) => {
          let defaultProps = {width: '100px', wrap: 'no'};
          if (i === 0) {
            defaultProps = {grow: '1', wrap: 'no'};
          }
          const targetPath = getColumnTargetPath(c);
          const columnSubPath = getColumnSubPath(c);
          const text = getColumnText(c, entity);
          if (isTargetingValueOrRef(entity, targetPath) && text !== null) {
            return (
              <Driller
                entityId={text}
                rowId={rowIndex}
                key={i}
                column={c}
                onDrillDown={this.props.onDrillDown}
                onSelect={this.props.onSelect}
                onEdit={this.props.onEdit}
                path={columnSubPath}
              />
            );
          } else {
            return (
              <TableCell
                rowId={rowIndex}
                key={i}
                index={i}
                isLast="false"
                isHeader="false"
                {...defaultProps}
                {...getColumnProps(c)}
                text={text}
                selectionChanged={this.props.onSelect}
              />
            );
          }
        })}
        {this.renderButtons()}
      </div>
    );
  }
}

/******************************************************************************/

export default Widget.connect((state, props) => {
  const entityId = props.useView ? `entity-view@${props.id}` : props.id;
  return {
    id: props.id,
    entity: state.get(`backend.${entityId}`),
  };
})(EntityRow);
