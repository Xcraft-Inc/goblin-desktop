//T:2019-02-27

import React from 'react';
import ReactDOM from 'react-dom';
import scrollIntoViewIfNeeded from 'scroll-into-view-if-needed';
import Widget from 'goblin-laboratory/widgets/widget';
import {Unit} from 'goblin-theme';
const px = Unit.toPx;

import Workitem from 'goblin-desktop/widgets/workitem/widget';
import Container from 'goblin-gadgets/widgets/container/widget';
import Button from 'goblin-gadgets/widgets/button/widget';
import Label from 'goblin-gadgets/widgets/label/widget';
import Field from 'goblin-gadgets/widgets/field/widget';
import DragCab from 'goblin-gadgets/widgets/drag-cab/widget';
import Combo from 'goblin-gadgets/widgets/combo/widget';

import importer from 'goblin_importer';
import T from 't';

const uiImporter = importer('ui');

/******************************************************************************/

class Plugin extends Widget {
  constructor() {
    super(...arguments);

    this._refs = {};
    this._scrollEntityId = null;
    this.comboButton = null;

    this.state = {
      showActionMenu: false,
    };

    this.onAction = this.onAction.bind(this);
    this.onActionAdd = this.onActionAdd.bind(this);
    this.onSwapExtended = this.onSwapExtended.bind(this);
    this.onDeleteEntity = this.onDeleteEntity.bind(this);
    this.onEditEntity = this.onEditEntity.bind(this);
    this.onEntityDragged = this.onEntityDragged.bind(this);
    this.doProxy = this.doProxy.bind(this);
    this.open = this.open.bind(this);
    this.close = this.close.bind(this);
  }

  get showActionMenu() {
    return this.state.showActionMenu;
  }

  set showActionMenu(value) {
    this.setState({
      showActionMenu: value,
    });
  }

  _scrollIntoView(duration) {
    if (
      !this._scrollEntityId ||
      !this._refs[this._scrollEntityId] ||
      this._scrollEntityId !== this.props.extendedId
    ) {
      return;
    }

    scrollIntoViewIfNeeded(this._refs[this._scrollEntityId], {
      duration,
      // HACK: we need to fix the transitions in order to remove this offset
      offset: {
        top: 3,
      },
    });
  }

  componentDidUpdate() {
    this._scrollIntoView(150);
  }

  onAction(actionName) {
    const service = this.props.namespace;
    switch (actionName) {
      case 'add':
        this.doAs(service, actionName);
        break;
      case 'clear':
        this.doAs(service, actionName);
        break;
      default:
        this.doAs(service, 'do-action', {action: actionName});
    }
  }

  onActionAdd() {
    this.onAction('add');
  }

  onSwapExtended(entityId) {
    this._scrollEntityId = entityId;
    this.dispatch({type: 'TOGGLE_EXTENDED', entityId});
  }

  onDeleteEntity(entityId) {
    const service = this.props.namespace;
    this.doAs(service, 'remove', {entityId});
  }

  onEditEntity(entityId) {
    const service = this.props.namespace;
    this.doAs(service, 'edit', {entityId});
  }

  onEntityDragged(selectedIds, toId, ownerId, ownerKind) {
    const service = this.props.namespace;
    if (ownerId === this.props.id) {
      this.doAs(service, 'drag', {
        fromId: selectedIds[0],
        toId: toId,
      });
    } else {
      this.doAs(service, 'remove', {
        entityId: selectedIds[0],
      });
      this.cmd(`${service}.add`, {
        id: ownerId,
        entityId: selectedIds[0],
      });
    }
  }

  getActionMenuList(numberOfIds) {
    const list = [];

    if (this.props.actionMenu) {
      for (const item of this.props.actionMenu) {
        if (!item.min || item.min <= numberOfIds) {
          list.push({
            glyph: item.glyph,
            text: item.text,
            action: () => this.onAction(item.actionName),
          });
        }
      }
    }

    if (
      numberOfIds > 0 &&
      (!this.props.arity || !this.props.arity.startsWith('1'))
    ) {
      if (list.length > 0) {
        list.push({
          separator: true,
        });
      }
      list.push({
        glyph: 'solid/trash',
        text: T('Tout supprimer'),
        action: () => this.onAction('clear'),
      });
    }

    return list;
  }

  doProxy(index) {
    return (action, args) => {
      const workitemId = `${this.props.editorWidget}${
        this.props.mode ? `@${this.props.mode}` : ''
      }@${this.context.desktopId}@${this.props.entityIds.get(index)}`;
      this.doFor(workitemId, action, args);
    };
  }

  open() {
    this.showActionMenu = true;
  }

  close() {
    this.showActionMenu = false;
  }

  /******************************************************************************/

  renderHeaderSearch() {
    if (this.props.searchHinter) {
      return (
        <Field
          shape="rounded"
          labelGlyph="solid/search"
          labelWidth="24px"
          fieldWidth="180px"
          hintText={T('Ajouter existant')}
          tooltip={T(
            'Ajouter un élément existant en le choisissant dans une liste'
          )}
          kind="hinter"
          required={false}
          hinter={this.props.searchHinter}
          horizontalSpacing="large"
        />
      );
    } else {
      return null;
    }
  }

  renderHeaderActionMenuButton(numberOfIds) {
    const list = this.getActionMenuList(numberOfIds);
    if (list.length > 0) {
      return (
        <Button
          ref={(x) => (this.comboButton = x)}
          glyph="solid/ellipsis-h"
          horizontalSpacing="large"
          active={this.showActionMenu}
          onClick={this.open}
        />
      );
    } else {
      return null;
    }
  }

  renderHeaderActionMenu(numberOfIds) {
    if (this.showActionMenu) {
      const node = ReactDOM.findDOMNode(this.comboButton);
      const rect = node.getBoundingClientRect();
      const top = Unit.add(
        px(rect.bottom),
        this.context.theme.shapes.flyingBalloonTriangleSize
      );

      return (
        <Combo
          menuType="menu"
          left={(rect.left + rect.right) / 2}
          top={top}
          list={this.getActionMenuList(numberOfIds)}
          close={this.close}
        />
      );
    } else {
      return null;
    }
  }

  renderHeaderAdd(numberOfIds) {
    const canAdd =
      !this.props.disableAdd &&
      (!this.props.arity ||
        this.props.arity.endsWith('n') ||
        (this.props.arity === '0..1' && numberOfIds === 0));

    if (canAdd) {
      return (
        <Button
          glyph="solid/plus"
          text={this.props.addText || T('Ajouter')}
          tooltip={this.props.addTooltip}
          glyphPosition="right"
          onClick={this.onActionAdd}
        />
      );
    } else {
      return null;
    }
  }

  renderHeader(numberOfIds) {
    const headerClass =
      this.props.entityIds.size === 0
        ? this.styles.classNames.headerEmpty
        : this.styles.classNames.header;

    const title = this.props.pluginTitle
      ? this.props.pluginTitle
      : this.props.title;

    if (this.props.readonly) {
      return (
        <div className={headerClass}>
          <Label text={title} grow="1" kind="title" />
        </div>
      );
    } else {
      return (
        <div className={headerClass}>
          <Label text={title} grow="1" kind="title" />
          {this.renderHeaderSearch()}
          {this.renderHeaderActionMenuButton(numberOfIds)}
          {this.renderHeaderAdd(numberOfIds)}
          {this.renderHeaderActionMenu(numberOfIds)}
        </div>
      );
    }
  }

  renderItem(entityId, extended, index) {
    const workitemUI = uiImporter(this.props.editorWidget);
    const workitemId = `${this.props.editorWidget}${
      this.props.mode ? `@${this.props.mode}` : ''
    }@${this.context.desktopId}@${this.props.entityIds.get(index)}`;

    if (!workitemUI.plugin) {
      return null;
    }

    const itemClass = extended
      ? this.props.embedded
        ? this.styles.classNames.extendedEmbeddedItem
        : this.styles.classNames.extendedItem
      : this.props.embedded
      ? this.styles.classNames.compactedEmbeddedItem
      : this.styles.classNames.compactedItem;

    const key1 = this.props.readonly ? 'readonly' : 'edit';
    const key2 = extended ? 'extend' : 'compact';

    let UI = workitemUI.plugin[key1][key2];
    //let UI = this.WithState(
    //  workitemUI.plugin[key1][key2],
    //  'entityId'
    //)('.entityId');

    if (
      workitemUI.mappers &&
      workitemUI.mappers.plugin &&
      workitemUI.mappers.plugin[key1] &&
      workitemUI.mappers.plugin[key1][key2]
    ) {
      UI = this.mapWidget(
        UI,
        workitemUI.mappers.plugin[key1][key2],
        `backend.${entityId}`
      );
    }

    const type = entityId.split('@', 1)[0];
    const Loader = (props) => {
      if (props.loaded) {
        return (
          <Workitem
            id={workitemId}
            entityId={entityId}
            kind="form"
            readonly={this.props.readonly}
            dragServiceId={this.props.dragServiceId}
          >
            {this.buildLoader(entityId, () => (
              <UI
                id={workitemId}
                theme={this.context.theme}
                entityId={entityId}
                embeddedLevel={this.props.embeddedLevel}
                origin={this.props.origin}
                contextId={this.context.contextId}
                do={this.doProxy(index)}
                entitySchema={this.getSchema(type)}
              />
            ))}
          </Workitem>
        );
      } else {
        return (
          <Container busy={true}>
            <Label text={T('chargement...')} />
          </Container>
        );
      }
    };

    const LoadedWorkitem = this.mapWidget(
      Loader,
      (wid) => ({loaded: !!wid}),
      `backend.${workitemId}.id`
    );

    return (
      <div className={itemClass}>
        <LoadedWorkitem />
      </div>
    );
  }

  renderButtons(entityId, extended, numberOfIds) {
    if (extended) {
      const buttonsClass = this.props.readonly
        ? this.props.embedded
          ? this.styles.classNames.extendedEmbeddedReadonlyButtons
          : this.styles.classNames.extendedReadonlyButtons
        : this.props.embedded
        ? this.styles.classNames.extendedEmbeddedButtons
        : this.styles.classNames.extendedButtons;

      const canDelete =
        !this.props.readonly &&
        !this.props.disableDelete &&
        (!this.props.arity ||
          this.props.arity.startsWith('0') ||
          numberOfIds > 1);

      const kind = this.props.readonly ? 'plugin-light' : 'plugin-dark';

      let otherButtons = null;
      if (this.props.buttons) {
        otherButtons = this.props.buttons(entityId);
      }

      return (
        <div className={buttonsClass}>
          <Button
            width="32px"
            kind={kind}
            glyph="solid/angle-up"
            glyphSize="180%"
            tooltip={T('Replier')}
            active={false}
            activeColor={
              this.context.theme.palette.recurrenceExtendedBoxBackground
            }
            onClick={() => this.onSwapExtended(entityId)}
          />
          <Button
            width="32px"
            kind={kind}
            glyph="solid/pencil"
            tooltip={T('Editer')}
            onClick={() => this.onEditEntity(entityId)}
          />
          {otherButtons}
          {canDelete ? (
            <Button
              width="32px"
              kind={kind}
              glyph="solid/trash"
              tooltip={T('Supprimer')}
              onClick={() => this.onDeleteEntity(entityId)}
            />
          ) : null}
        </div>
      );
    } else {
      const buttonsClass = this.props.readonly
        ? this.props.embedded
          ? this.styles.classNames.compactedEmbeddedReadonlyButtons
          : this.styles.classNames.compactedReadonlyButtons
        : this.props.embedded
        ? this.styles.classNames.compactedEmbeddedButtons
        : this.styles.classNames.compactedButtons;

      const kind =
        this.props.readonly || !this.props.embedded
          ? 'plugin-light'
          : 'plugin-dark';

      return (
        <div className={buttonsClass}>
          {this.props.readonly && !this.props.embedded ? (
            <Button
              width="32px"
              kind={kind}
              glyph="solid/pencil"
              tooltip={T('Editer')}
              onClick={() => this.onEditEntity(entityId)}
            />
          ) : null}
          <Button
            width="32px"
            kind={kind}
            glyph="solid/angle-down"
            glyphSize="180%"
            tooltip={T('Etendre')}
            active={false}
            activeColor={
              this.context.theme.palette.recurrenceExtendedBoxBackground
            }
            onClick={() => this.onSwapExtended(entityId)}
          />
        </div>
      );
    }
  }

  renderRowContent(entityId, extended, numberOfIds, index) {
    const rowClass = extended
      ? this.props.embedded
        ? this.styles.classNames.extendedEmbeddedRow
        : this.styles.classNames.extendedRow
      : numberOfIds > 1 && this.props.horizontalSeparator !== 'compact'
      ? this.props.embedded
        ? this.styles.classNames.compactedEmbeddedDashedRow
        : this.styles.classNames.compactedDashedRow
      : this.props.embedded
      ? this.styles.classNames.compactedEmbeddedRow
      : this.styles.classNames.compactedRow;

    return (
      <Container
        kind="row-draggable"
        key={index}
        ref={(n) => {
          if (n) {
            this._refs[entityId] = ReactDOM.findDOMNode(n);
          }
        }}
      >
        <div className={rowClass}>
          {this.renderItem(entityId, extended, index)}
          {this.renderButtons(entityId, extended, numberOfIds)}
        </div>
      </Container>
    );
  }

  renderRow(entityId, extended, dragEnabled, numberOfIds, index) {
    if (dragEnabled) {
      return (
        <DragCab
          key={index}
          dragController={this.props.dragType || this.props.id}
          dragOwnerId={entityId}
          dragMode="handle"
          dragHandleWidth={this.context.theme.shapes.containerMargin}
          direction="vertical"
          color={this.context.theme.palette.dragAndDropHover}
          thickness={this.context.theme.shapes.dragAndDropTicketThickness}
          overSpacing="0px"
          verticalSpacing="0px"
          radius="0px"
          doClickAction={() => this.onSwapExtended(entityId)}
          doDragEnding={this.onEntityDragged}
        >
          {this.renderRowContent(entityId, extended, numberOfIds, index)}
        </DragCab>
      );
    } else {
      return this.renderRowContent(entityId, extended, numberOfIds, index);
    }
  }

  renderRows(entityIds) {
    const dragEnabled =
      !this.props.readonly && (entityIds.length > 1 || !!this.props.dragType);

    let index = 0;

    return entityIds.map((entityId) => {
      const extended = entityId === this.props.extendedId;
      return this.renderRow(
        entityId,
        extended,
        dragEnabled,
        entityIds.length,
        index++
      );
    });
  }

  renderDefault() {
    const entityIds = this.props.entityIds.valueSeq().toArray();
    if (entityIds.length === 0 && this.props.readonly && this.props.embedded) {
      return null;
    }

    let boxClass = null;
    if (!this.props.entityIds || this.props.entityIds.size === 0) {
      boxClass = this.props.embedded
        ? this.styles.classNames.emptyembeddedBox
        : this.styles.classNames.emptyBox;
    } else {
      boxClass = this.props.embedded
        ? this.styles.classNames.embeddedBox
        : this.styles.classNames.box;
    }

    return (
      <div className={boxClass}>
        {this.renderHeader(entityIds.length)}
        <Container
          kind="column"
          dragController={this.props.dragType || this.props.id}
          dragSource={this.props.id}
          dragOwnerId={this.props.id}
        >
          {this.renderRows(entityIds)}
        </Container>
      </div>
    );
  }

  render() {
    this._refs = {};

    if (!this.props.id || !this.props.entityIds) {
      return null;
    }

    if (!this.props.editorWidget) {
      return null;
    }

    return this.renderDefault();
  }
}

/******************************************************************************/

const select = (root) => (state, id) => (prop) => {
  if (!id) {
    return null;
  }
  const target = state.get(`${root}.${id}`);
  if (!target) {
    return null;
  }
  return target.get(prop);
};

const withBackend = select('backend');
const withWidget = select('widgets');

export default Widget.connect((state, props) => {
  const plugin = withBackend(state, props.id);
  const entity = withBackend(state, plugin('forEntity'));
  const widget = withWidget(state, props.id);
  return {
    id: props.id,
    title: plugin('title'),
    editorWidget: plugin('editorWidget'),
    arity: plugin('arity'),
    mode: plugin('mode'),
    entityIds: entity(plugin('entityPath')),
    namespace: `${plugin('type')}-plugin`,
    extendedId: widget('extendedId'),
  };
})(Plugin);
