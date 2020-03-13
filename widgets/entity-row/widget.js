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

import RetroGear from 'goblin-gadgets/widgets/retro-gear/widget';
import {ColorManipulator} from 'electrum-theme';
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

  /******************************************************************************/

  renderSpinner() {
    if (this.context.theme.look.name === 'retro') {
      return (
        <div className={this.styles.classNames.busyBox}>
          <RetroGear
            color={ColorManipulator.darken(
              this.context.theme.palette.light,
              0.2
            )}
            left="0px"
            top="0px"
            radius="20px"
            toothCount={12}
            toothThickness={6}
            rotationDuration="3s"
            rotationDirection="cw"
            shadow="no"
          />
        </div>
      );
    } else {
      return <FontAwesomeIcon icon={[`fas`, 'spinner']} size={'1x'} pulse />;
    }
  }

  render() {
    if (this._loadRequested === false && this.props.entityId) {
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
          {this.renderSpinner()}
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
          maxHeight={this.props.maxHeight}
          cellFormat="original"
          text={text}
        />
      );
    }
  }

  renderSpinner() {
    if (this.context.theme.look.name === 'retro') {
      return (
        <div className={this.styles.classNames.busyBox}>
          <RetroGear
            color={ColorManipulator.darken(
              this.context.theme.palette.light,
              0.2
            )}
            left="0px"
            top="0px"
            radius="20px"
            toothCount={12}
            toothThickness={6}
            rotationDuration="3s"
            rotationDirection="cw"
            shadow="no"
          />
        </div>
      );
    } else {
      return <FontAwesomeIcon icon={[`fas`, 'spinner']} size={'1x'} pulse />;
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
          <TableCell isLast="false" isHeader="false">
            {this.renderSpinner()}
          </TableCell>
        </div>
      );
    }

    const n = new Shredder({
      text: rowIndex + 1,
      weight: 'bold',
    });

    const divProps = {};
    if (this.props.onSelect) {
      divProps.onClick = () => this.props.onSelect(rowIndex);
    }

    return (
      <div className={this.styles.classNames.entityRow} {...divProps}>
        <TableCell
          rowId={rowIndex}
          key={rowIndex}
          index={rowIndex}
          isLast="false"
          isHeader="false"
          width={this.props.firstColumnWidth || '50px'}
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
  const entity = state.get(`backend.${entityId}`);
  if (!entity) {
    // TODO: !!!
    //? console.warn(`>>> Entity ${entityId} not found <<<`);
  } else if (!entity.get('meta')) {
    // TODO: Why some entities don't have meta ???
    //? console.warn(`>>> Entity ${entityId} has no meta <<<`);
  }

  return {
    id: props.id,
    entity,
  };
})(EntityRow);
