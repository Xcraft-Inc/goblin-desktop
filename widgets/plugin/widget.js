import React from 'react';
import Widget from 'laboratory/widget';
import * as Bool from 'gadgets/boolean-helpers';

import Workitem from 'desktop/workitem/widget';
import Container from 'gadgets/container/widget';
import Button from 'gadgets/button/widget';
import Label from 'gadgets/label/widget';
import DragCab from 'gadgets/drag-cab/widget';

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

  onEntityDragged (selectedIds, toId) {
    const service = this.props.id.split ('@')[0];
    this.doAs (service, 'drag', {
      fromId: selectedIds[0],
      toId: toId,
    });
  }

  /******************************************************************************/

  renderHeader () {
    const headerClass = this.props.entityIds.size === 0
      ? this.styles.classNames.headerEmpty
      : this.styles.classNames.header;

    if (Bool.isTrue (this.props.readonly)) {
      return (
        <div className={headerClass}>
          <Label text={this.props.title} grow="1" kind="title" />
        </div>
      );
    } else {
      return (
        <div className={headerClass}>
          <Label text={this.props.title} grow="1" kind="title" />
          <Button
            glyph="plus"
            text="Ajouter"
            glyphPosition="right"
            spacing="overlap"
            onClick={this.onCreateEntity}
          />
        </div>
      );
    }
  }

  renderItem (entityId, extended, index) {
    const workitemUI = uiImporter (this.props.editorWidget);
    const workitemId = `${this.props.editorWidget}@${this.props.entityIds.get (index)}`;

    if (extended) {
      const itemClass = this.styles.classNames.extendedItem;

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
            />
          </Workitem>
        </div>
      );
    } else {
      const itemClass = this.styles.classNames.compactedItem;

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
            readonly="true"
            id={workitemId}
            entityId={entityId}
            kind="form"
            readonly={this.props.readonly}
          >
            <CompactedUI
              id={workitemId}
              theme={this.context.theme}
              entityId={entityId}
            />
          </Workitem>
        </div>
      );
    }
  }

  renderButtons (entityId, extended) {
    if (extended) {
      const buttonsClass = this.styles.classNames.extendedButtons;
      const sajexClass = this.styles.classNames.sajex;
      const spaceClass = this.styles.classNames.space;

      return (
        <div className={buttonsClass}>
          <Button
            kind="recurrence"
            glyph="caret-up"
            tooltip="Replier"
            active="false"
            activeColor={
              this.context.theme.palette.recurrenceExtendedBoxBackground
            }
            onClick={() => this.onSwapExtended (entityId)}
          />
          <div className={sajexClass} />
          <Button
            kind="recurrence"
            glyph="pencil"
            tooltip="Editer"
            onClick={() => this.onEditEntity (entityId)}
          />
          <div className={spaceClass} />
          {Bool.isTrue (this.props.readonly)
            ? null
            : <Button
                kind="recurrence"
                glyph="trash"
                tooltip="Supprimer"
                onClick={() => this.onDeleteEntity (entityId)}
              />}

        </div>
      );
    } else {
      const buttonsClass = this.styles.classNames.compactedButtons;

      return (
        <div className={buttonsClass}>
          <Button
            kind="recurrence"
            glyph="caret-down"
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

  renderRowContent (entityId, extended, index) {
    const rowClass = extended
      ? this.styles.classNames.extendedRow
      : this.styles.classNames.compactedRow;

    return (
      <div key={index} className={rowClass}>
        {this.renderItem (entityId, extended, index)}
        {this.renderButtons (entityId, extended)}
      </div>
    );
  }

  renderRow (entityId, extended, index) {
    if (Bool.isTrue (this.props.readonly)) {
      return this.renderRowContent (entityId, extended, index);
    } else {
      return (
        <DragCab
          key={index}
          dragController="codispo-ticket"
          dragWidthDetect={this.context.theme.shapes.containerMargin}
          dragOwnerId={entityId}
          direction="vertical"
          mode="corner-top-left"
          color={this.context.theme.palette.roadbookDragAndDropHover}
          thickness={this.context.theme.shapes.dragAndDropTicketThickness}
          overSpacing="0px"
          verticalSpacing="0px"
          radius="0px"
        >
          {this.renderRowContent (entityId, extended, index)}
        </DragCab>
      );
    }

    ////////////////////////////////////////////////////////////////////////////
    if (extended) {
      const rowClass = this.styles.classNames.extendedRow;
      return (
        <div key={index} className={rowClass}>
          {this.renderItem (entityId, extended, index)}
          {this.renderButtons (entityId, extended)}
        </div>
      );
    } else {
      const rowClass = this.styles.classNames.compactedRow;
      return (
        <DragCab
          key={index}
          dragController={this.props.id}
          direction="vertical"
          color={this.context.theme.palette.dragAndDropHover}
          thickness={this.context.theme.shapes.dragAndDropTicketThickness}
          dragOwnerId={entityId}
          doClickAction={() => this.onSwapExtended (entityId)}
          doDragEnding={this.onEntityDragged}
        >
          <div className={rowClass}>
            {this.renderItem (entityId, extended, index)}
            {this.renderButtons (entityId, extended)}
          </div>
        </DragCab>
      );
    }
  }

  renderRows () {
    const entityIds = this.props.entityIds.toArray ();
    let index = 0;
    return entityIds.map (entityId => {
      const extended = entityId === this.props.extendedId;
      return this.renderRow (entityId, extended, index++);
    });
  }

  render () {
    if (!this.props.id || !this.props.entityIds) {
      return null;
    }

    if (!this.props.editorWidget) {
      // return <div>No editor provided in props!</div>;
      return null;
    }

    let boxClass = null;
    if (!this.props.entityIds || this.props.entityIds.size === 0) {
      boxClass = this.props.level === '2'
        ? this.styles.classNames.emptyEmbededBox
        : this.styles.classNames.emptyBox;
    } else {
      boxClass = this.props.level === '2'
        ? this.styles.classNames.embededBox
        : this.styles.classNames.box;
    }

    return (
      <div className={boxClass}>
        {this.renderHeader ()}
        <Container
          kind="column"
          dragController={this.props.id}
          dragSource={this.props.id}
          dragOwnerId={this.props.id}
        >
          {this.renderRows ()}
        </Container>
      </div>
    );
  }
}

/******************************************************************************/
export default Plugin;
