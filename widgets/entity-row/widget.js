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
  getColumnDisplayText,
  isTargetingValueOrRef,
} = ListHelpers;

import Shredder from 'xcraft-core-shredder';

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

  /******************************************************************************/

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

  renderCell(cell, index) {
    const targetPath = getColumnTargetPath(cell);
    const columnSubPath = getColumnSubPath(cell);
    const text = getColumnDisplayText(cell, this.props.entity);

    if (isTargetingValueOrRef(this.props.entity, targetPath) && text !== null) {
      return (
        <Driller
          entityId={text}
          rowId={this.props.rowIndex}
          key={index}
          column={cell}
          onDrillDown={this.props.onDrillDown}
          onSelect={this.props.onSelect}
          onEdit={this.props.onEdit}
          path={columnSubPath}
        />
      );
    } else {
      const props = getColumnProps(cell, index === 0);
      const {type, ...otherProps} = props;

      return (
        <TableCell
          rowId={this.props.rowIndex}
          key={index}
          index={index}
          isLast="false"
          isHeader="false"
          {...otherProps}
          text={text}
          selectionChanged={this.props.onSelect}
        />
      );
    }
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

    const n = new Shredder({
      text: rowIndex + 1,
      weight: 'bold',
    });

    return (
      <div className={this.styles.classNames.entityRow}>
        <TableCell
          rowId={rowIndex}
          key={rowIndex}
          index={rowIndex}
          isLast="false"
          isHeader="false"
          width="60px"
          wrap="no-end"
          text={n}
        />
        {columns.map((c, i) => this.renderCell(c, i))}
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
