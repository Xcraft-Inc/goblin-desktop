import React from 'react';
import Widget from 'laboratory/widget';
import * as Bool from 'gadgets/boolean-helpers';

import Workitem from 'desktop/workitem/widget';
import Container from 'gadgets/container/widget';
import Button from 'gadgets/button/widget';
import Label from 'gadgets/label/widget';
import DragCab from 'gadgets/drag-cab/widget';
import BacklogList from 'polypheme/backlog-list/widget';

import importer from 'laboratory/importer/';
const uiImporter = importer ('ui');

/******************************************************************************/

class Plugin extends Widget {
  constructor () {
    super (...arguments);

    this.onCreateEntity = this.onCreateEntity.bind (this);
    this.onSwapExtended = this.onSwapExtended.bind (this);
    this.onDeleteEntity = this.onDeleteEntity.bind (this);
    this.onEditEntity = this.onEditEntity.bind (this);
    this.onEntityDragged = this.onEntityDragged.bind (this);
  }

  static createFor (name, instance) {
    return instance.getPluginToEntityMapper (Plugin, name, 'entityIds') (
      '.entityIds'
    );
  }

  static get wiring () {
    return {
      id: 'id',
      title: 'title',
      extendedId: 'extendedId',
      entityIds: 'entityIds',
      editorWidget: 'editorWidget',
      arity: 'arity',
    };
  }

  onCreateEntity () {
    const service = this.props.id.split ('@')[0];
    this.doAs (service, 'add');
  }

  onSwapExtended (entityId) {
    const service = this.props.id.split ('@')[0];
    this.doAs (service, 'extend', {entityId});
  }

  onDeleteEntity (entityId) {
    const service = this.props.id.split ('@')[0];
    this.doAs (service, 'remove', {entityId});
  }

  onEditEntity (entityId) {
    const service = this.props.id.split ('@')[0];
    this.doAs (service, 'edit', {entityId});
  }

  onEntityDragged (selectedIds, toId, ownerId, ownerKind) {
    const service = this.props.id.split ('@')[0];
    if (ownerId === this.props.id) {
      this.doAs (service, 'drag', {
        fromId: selectedIds[0],
        toId: toId,
      });
    } else {
      this.doAs (service, 'remove', {
        entityId: selectedIds[0],
      });
      this.cmd (`${service}.add`, {
        id: ownerId,
        entityId: selectedIds[0],
      });
    }
  }

  /******************************************************************************/

  renderHeader (numberOfIds) {
    const headerClass = this.props.entityIds.size === 0
      ? this.styles.classNames.headerEmpty
      : this.styles.classNames.header;

    const title = this.props.pluginTitle
      ? this.props.pluginTitle
      : this.props.title;

    const canAdd =
      !Bool.isTrue (this.props.disableAdd) &&
      (!this.props.arity ||
        this.props.arity.endsWith ('n') ||
        (this.props.arity === '0..1' && numberOfIds === 0));

    if (Bool.isTrue (this.props.readonly)) {
      return (
        <div className={headerClass}>
          <Label text={title} grow="1" kind="title" />
        </div>
      );
    } else {
      return (
        <div className={headerClass}>
          <Label text={title} grow="1" kind="title" />
          {canAdd
            ? <Button
                glyph="plus"
                text="Ajouter"
                glyphPosition="right"
                spacing="overlap"
                onClick={this.onCreateEntity}
              />
            : null}
        </div>
      );
    }
  }

  renderItem (entityId, extended, index) {
    const workitemUI = uiImporter (this.props.editorWidget);
    const workitemId = `${this.props.editorWidget}@${this.props.entityIds.get (index)}`;

    if (extended) {
      const itemClass = Bool.isTrue (this.props.embedded)
        ? this.styles.classNames.extendedEmbeddedItem
        : this.styles.classNames.extendedItem;

      let ExtendedUI = null;
      if (Bool.isTrue (this.props.readonly)) {
        ExtendedUI = this.WithState (
          workitemUI.plugin.readonly.extend,
          'entityId'
        ) ('.entityId');
      } else {
        ExtendedUI = this.WithState (
          workitemUI.plugin.edit.extend,
          'entityId'
        ) ('.entityId');
      }

      return (
        <div className={itemClass}>
          <Workitem
            id={workitemId}
            entityId={entityId}
            kind="form"
            readonly={this.props.readonly}
          >
            <ExtendedUI
              id={workitemId}
              theme={this.context.theme}
              entityId={entityId}
              embeddedLevel={this.props.embeddedLevel}
            />
          </Workitem>
        </div>
      );
    } else {
      const itemClass = Bool.isTrue (this.props.embedded)
        ? this.styles.classNames.compactedEmbeddedItem
        : this.styles.classNames.compactedItem;

      let CompactedUI = null;
      if (Bool.isTrue (this.props.readonly)) {
        CompactedUI = this.WithState (
          workitemUI.plugin.readonly.compact,
          'entityId'
        ) ('.entityId');
      } else {
        CompactedUI = this.WithState (
          workitemUI.plugin.edit.compact,
          'entityId'
        ) ('.entityId');
      }

      return (
        <div className={itemClass}>
          <Workitem
            id={workitemId}
            entityId={entityId}
            kind="form"
            readonly={this.props.readonly}
            dragControllerId={this.props.dragControllerId}
          >
            <CompactedUI
              id={workitemId}
              theme={this.context.theme}
              entityId={entityId}
              embeddedLevel={this.props.embeddedLevel}
            />
          </Workitem>
        </div>
      );
    }
  }

  renderButtons (entityId, extended, numberOfIds) {
    if (extended) {
      const buttonsClass = Bool.isTrue (this.props.readonly)
        ? Bool.isTrue (this.props.embedded)
            ? this.styles.classNames.extendedEmbeddedReadonlyButtons
            : this.styles.classNames.extendedReadonlyButtons
        : Bool.isTrue (this.props.embedded)
            ? this.styles.classNames.extendedEmbeddedButtons
            : this.styles.classNames.extendedButtons;

      const canDelete =
        !Bool.isTrue (this.props.readonly) &&
        !Bool.isTrue (this.props.disableDelete) &&
        (!this.props.arity ||
          this.props.arity.startsWith ('0') ||
          numberOfIds > 1);

      const kind = Bool.isTrue (this.props.readonly)
        ? 'plugin-light'
        : 'plugin-dark';

      return (
        <div className={buttonsClass}>
          <Button
            width="32px"
            kind={kind}
            glyph="angle-up"
            glyphSize="180%"
            tooltip="Replier"
            active="false"
            activeColor={
              this.context.theme.palette.recurrenceExtendedBoxBackground
            }
            onClick={() => this.onSwapExtended (entityId)}
          />
          <Button
            width="32px"
            kind={kind}
            glyph="pencil"
            tooltip="Editer"
            onClick={() => this.onEditEntity (entityId)}
          />
          {canDelete
            ? <Button
                width="32px"
                kind={kind}
                glyph="trash"
                tooltip="Supprimer"
                onClick={() => this.onDeleteEntity (entityId)}
              />
            : null}

        </div>
      );
    } else {
      const buttonsClass = Bool.isTrue (this.props.readonly)
        ? Bool.isTrue (this.props.embedded)
            ? this.styles.classNames.compactedEmbeddedReadonlyButtons
            : this.styles.classNames.compactedReadonlyButtons
        : Bool.isTrue (this.props.embedded)
            ? this.styles.classNames.compactedEmbeddedButtons
            : this.styles.classNames.compactedButtons;

      const kind = Bool.isTrue (this.props.readonly) ||
        !Bool.isTrue (this.props.embedded)
        ? 'plugin-light'
        : 'plugin-dark';

      return (
        <div className={buttonsClass}>
          {Bool.isTrue (this.props.readonly) &&
            !Bool.isTrue (this.props.embedded)
            ? <Button
                width="32px"
                kind={kind}
                glyph="pencil"
                tooltip="Editer"
                onClick={() => this.onEditEntity (entityId)}
              />
            : null}
          <Button
            width="32px"
            kind={kind}
            glyph="angle-down"
            glyphSize="180%"
            tooltip="Etendre"
            active="false"
            activeColor={
              this.context.theme.palette.recurrenceExtendedBoxBackground
            }
            onClick={() => this.onSwapExtended (entityId)}
          />
        </div>
      );
    }
  }

  renderRowContent (entityId, extended, numberOfIds, index) {
    const rowClass = extended
      ? Bool.isTrue (this.props.embedded)
          ? this.styles.classNames.extendedEmbeddedRow
          : this.styles.classNames.extendedRow
      : numberOfIds > 1 && this.props.horizontalSeparator !== 'compact'
          ? Bool.isTrue (this.props.embedded)
              ? this.styles.classNames.compactedEmbeddedDashedRow
              : this.styles.classNames.compactedDashedRow
          : Bool.isTrue (this.props.embedded)
              ? this.styles.classNames.compactedEmbeddedRow
              : this.styles.classNames.compactedRow;

    return (
      <Container kind="row-draggable" key={index}>
        <div className={rowClass}>
          {this.renderItem (entityId, extended, index)}
          {this.renderButtons (entityId, extended, numberOfIds)}
        </div>
      </Container>
    );
  }

  renderRow (entityId, extended, dragEnabled, numberOfIds, index) {
    if (dragEnabled) {
      return (
        <DragCab
          key={index}
          dragController={this.props.dragType || this.props.id}
          dragOwnerId={entityId}
          dragMode="handle"
          dragHandleWidth={this.context.theme.shapes.containerMargin}
          direction="vertical"
          color={this.context.theme.palette.roadbookDragAndDropHover}
          thickness={this.context.theme.shapes.dragAndDropTicketThickness}
          overSpacing="0px"
          verticalSpacing="0px"
          radius="0px"
          doClickAction={() => this.onSwapExtended (entityId)}
          doDragEnding={this.onEntityDragged}
        >
          {this.renderRowContent (entityId, extended, numberOfIds, index)}
        </DragCab>
      );
    } else {
      return this.renderRowContent (entityId, extended, numberOfIds, index);
    }
  }

  renderRows (entityIds) {
    const dragEnabled =
      !Bool.isTrue (this.props.readonly) &&
      (entityIds.length > 1 || !!this.props.dragType);

    let index = 0;

    return entityIds.map (entityId => {
      const extended = entityId === this.props.extendedId;
      return this.renderRow (
        entityId,
        extended,
        dragEnabled,
        entityIds.length,
        index++
      );
    });
  }

  renderDefault () {
    const entityIds = this.props.entityIds.toArray ();
    if (
      entityIds.length === 0 &&
      Bool.isTrue (this.props.readonly) &&
      Bool.isTrue (this.props.embedded)
    ) {
      return null;
    }

    let boxClass = null;
    if (!this.props.entityIds || this.props.entityIds.size === 0) {
      boxClass = Bool.isTrue (this.props.embedded)
        ? this.styles.classNames.emptyembeddedBox
        : this.styles.classNames.emptyBox;
    } else {
      boxClass = Bool.isTrue (this.props.embedded)
        ? this.styles.classNames.embeddedBox
        : this.styles.classNames.box;
    }

    return (
      <div className={boxClass}>
        {this.renderHeader (entityIds.length)}
        <Container
          kind="column"
          dragController={this.props.dragType || this.props.id}
          dragSource={this.props.id}
          dragOwnerId={this.props.id}
        >
          {this.renderRows (entityIds)}
        </Container>
      </div>
    );
  }

  renderBacklog () {
    return <BacklogList {...this.props} />;
  }

  render () {
    if (!this.props.id || !this.props.entityIds) {
      return null;
    }

    if (!this.props.editorWidget) {
      // return <div>No editor provided in props!</div>;
      return null;
    }

    if (this.props.pluginType === 'backlog') {
      return this.renderBacklog ();
    } else {
      return this.renderDefault ();
    }
  }
}

/******************************************************************************/
export default Plugin;
