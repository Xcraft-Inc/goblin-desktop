//T:2019-02-27
import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import TableCell from 'goblin-gadgets/widgets/table-cell/widget';
import Gauge from 'goblin-gadgets/widgets/gauge/widget';
import Label from 'goblin-gadgets/widgets/label/widget';
import Spinner from 'goblin-gadgets/widgets/spinner/widget';
import ColoredContainer from 'goblin-gadgets/widgets/colored-container/widget';
import EntityRowButton from 'goblin-desktop/widgets/entity-row-button/widget';
import T from 't';
import ListHelpers from 'goblin-workshop/lib/list-helpers.js';
import RetroGear from 'goblin-gadgets/widgets/retro-gear/widget';
import {ColorManipulator} from 'goblin-theme';
import Shredder from 'xcraft-core-shredder';
import {Unit} from 'goblin-theme';

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
      <Spinner size="24px" />;
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
          isLast={false}
          isHeader={false}
          text={this.props.text}
          {...ListHelpers.getColumnProps(
            this.props.column,
            this.props.settings
          )}
        />
      );
    } else {
      return (
        <TableCell
          rowId={this.props.rowId}
          isLast={false}
          isHeader={false}
          {...ListHelpers.getColumnProps(
            this.props.column,
            this.props.settings
          )}
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

const Score = Widget.connect((state, props) => {
  const highlights = state.get(`backend.${props.listId}.highlights`);
  let score;
  if (highlights.get(props.entityId, null) !== null) {
    score = highlights.get(`${props.entityId}.score`);
  }
  return {value: score * 100};
})(Gauge);

/******************************************************************************/

const Colored = Widget.connect((state, props) => {
  const highlights = state.get(`backend.${props.listId}.highlights`);
  let score;
  if (highlights.get(props.entityId, null) !== null) {
    score = highlights.get(`${props.entityId}.score`);
  }
  return {value: score * 100};
})(ColoredContainer);

/******************************************************************************/

const TableCellWithHighlight = Widget.connect((state, props) => {
  const highlights = state.get(`backend.${props.listId}.highlights`);
  let text = props.text;
  if (highlights.get(props.entityId, null) !== null) {
    const auto = highlights.get(`${props.entityId}.auto`);
    const phonetic = highlights.get(`${props.entityId}.phonetic`);
    const info = highlights.get(`${props.entityId}.info`);
    if (auto && !phonetic) {
      text = auto;
    } else if (!auto && phonetic) {
      text = phonetic;
    } else if (auto && phonetic) {
      text = auto;
    } else if (info) {
      text = highlights.get(`${props.entityId}.info`);
    }
  }
  return {text};
})(TableCell);

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

  isFilterPath(path) {
    if (this.props.hasFilter && this.props.filterPaths) {
      return this.props.filterPaths.includes(path);
    }
    return false;
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

  renderCellTextBar(cell, text, isFilter, index) {
    const props = ListHelpers.getColumnProps(cell, this.props.settings);
    const {type, width, ...otherProps} = props;

    if (isFilter) {
      const w = Unit.sub(width, '15px');
      return (
        <div key={index} className={this.styles.classNames.filteredCellBarre}>
          <Colored
            entityId={this.props.id}
            listId={this.props.listId}
            gradient="red-yellow-green"
            width="5px"
            alpha={0.9}
          />
          <Label width="10px" />
          <TableCellWithHighlight
            entityId={this.props.id}
            listId={this.props.listId}
            rowId={this.props.rowIndex}
            index={index}
            isLast={false}
            isHeader={false}
            width={w}
            {...otherProps}
            maxHeight={this.props.maxHeight}
            cellFormat="original"
            text={text}
          />
        </div>
      );
    } else {
      return (
        <TableCell
          rowId={this.props.rowIndex}
          key={index}
          index={index}
          isLast={false}
          isHeader={false}
          width={width}
          {...otherProps}
          maxHeight={this.props.maxHeight}
          cellFormat="original"
          text={text}
        />
      );
    }
  }

  renderCellTextCarnaval(cell, text, isFilter, index) {
    const props = ListHelpers.getColumnProps(cell, this.props.settings);
    const {type, width, ...otherProps} = props;

    if (isFilter) {
      const w = Unit.sub(width, '15px');
      return (
        <Colored
          key={index}
          entityId={this.props.id}
          listId={this.props.listId}
          gradient="red-yellow-green"
          margin="-2px 5px -2px 0px"
          padding="0px 0px 0px 10px"
          radius="5px"
          alpha={this.context.theme.palette.isDarkTheme ? 0.3 : 0.8}
        >
          <TableCellWithHighlight
            entityId={this.props.id}
            listId={this.props.listId}
            rowId={this.props.rowIndex}
            index={index}
            isLast={false}
            isHeader={false}
            width={w}
            {...otherProps}
            maxHeight={this.props.maxHeight}
            cellFormat="original"
            text={text}
          />
        </Colored>
      );
    } else {
      return (
        <TableCell
          rowId={this.props.rowIndex}
          key={index}
          index={index}
          isLast={false}
          isHeader={false}
          width={width}
          {...otherProps}
          maxHeight={this.props.maxHeight}
          cellFormat="original"
          text={text}
        />
      );
    }
  }

  renderCellTextGauge(cell, text, isFilter, index) {
    const props = ListHelpers.getColumnProps(cell, this.props.settings);
    const {type, width, ...otherProps} = props;

    if (isFilter) {
      const w = Unit.sub(width, '12px');
      return (
        <div key={index} className={this.styles.classNames.filteredCellGauge}>
          <Score
            entityId={this.props.id}
            listId={this.props.listId}
            kind="simple"
            gradient="red-yellow-green"
            direction="vertical"
            width="6px"
            height="unset"
          />
          <Label width="6px" />
          <TableCellWithHighlight
            entityId={this.props.id}
            listId={this.props.listId}
            rowId={this.props.rowIndex}
            index={index}
            isLast={false}
            isHeader={false}
            width={w}
            {...otherProps}
            maxHeight={this.props.maxHeight}
            cellFormat="original"
            text={text}
          />
        </div>
      );
    } else {
      return (
        <TableCell
          rowId={this.props.rowIndex}
          key={index}
          index={index}
          isLast={false}
          isHeader={false}
          width={width}
          {...otherProps}
          maxHeight={this.props.maxHeight}
          cellFormat="original"
          text={text}
        />
      );
    }
  }

  renderCellText(cell, text, isFilter, index) {
    switch (this.props.variant) {
      default:
      case 'gauge':
        return this.renderCellTextGauge(cell, text, isFilter, index);
      case 'bar':
        return this.renderCellTextBar(cell, text, isFilter, index);
      case 'carnaval':
        return this.renderCellTextCarnaval(cell, text, isFilter, index);
    }
  }

  renderCell(cell, index) {
    if (!cell) {
      return null;
    }
    const targetPath = ListHelpers.getColumnTargetPath(cell);
    const columnSubPath = ListHelpers.getColumnSubPath(cell);
    let text = ListHelpers.getColumnDisplayText(cell, this.props.entity);

    const {schema} = this.props;
    if (schema) {
      const propSchema = schema.get(targetPath, null);
      if (propSchema) {
        const {type} = propSchema.pick('type');
        if (type === 'enum') {
          const valuesInfo = propSchema.get('valuesInfo');
          if (valuesInfo) {
            text = valuesInfo.get(`${text}.text`, text);
          }
        }
      }
    }

    if (
      ListHelpers.isTargetingValueOrRef(this.props.entity, targetPath) &&
      text !== null
    ) {
      return (
        <Driller
          entityId={text}
          schema={this.props.schema}
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
      const isFilter = this.isFilterPath(targetPath);
      return this.renderCellText(cell, text, isFilter, index);
    }
  }

  renderSpinner() {
    if (this.context.theme.look.name === 'retro') {
      return (
        <div className={this.styles.classNames.spinner}>
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
        </div>
      );
    } else {
      return (
        <div className={this.styles.classNames.spinner}>
          <Spinner size="24px" />
        </div>
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
        <div className={this.styles.classNames.busyEntityRow}>
          <TableCell isLast={false} isHeader={false}>
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
          index={rowIndex}
          isLast={false}
          isHeader={false}
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
