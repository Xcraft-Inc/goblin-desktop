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

    this.state = {
      hoverId: null,
    };

    this.onCreateEntity = this.onCreateEntity.bind (this);
    this.onSwapExtended = this.onSwapExtended.bind (this);
    this.onDeleteEntity = this.onDeleteEntity.bind (this);
    this.onEditEntity = this.onEditEntity.bind (this);
    this.onEntityDragged = this.onEntityDragged.bind (this);
    this.onMouseOver = this.onMouseOver.bind (this);
    this.onMouseOut = this.onMouseOut.bind (this);
  }

  get hoverId () {
    return this.state.hoverId;
  }

  set hoverId (value) {
    this.setState ({
      hoverId: value,
    });
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

  onMouseOver (entityId) {
    //? this.hoverId = entityId;
  }

  onMouseOut (entityId) {
    //? this.hoverId = null;
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
            kind="check-button"
            glyph="angle-up"
            glyphSize="180%"
            tooltip="Replier"
            active="false"
            activeColor={
              this.context.theme.palette.recurrenceExtendedBoxBackground
            }
            onClick={() => this.onSwapExtended (entityId)}
            mouseOver={() => this.onMouseOver (entityId)}
            mouseOut={() => this.onMouseOut (entityId)}
          />
          <div className={spaceClass} />
          <Button
            kind="check-button"
            glyph="pencil"
            tooltip="Editer"
            onClick={() => this.onEditEntity (entityId)}
            mouseOver={() => this.onMouseOver (entityId)}
            mouseOut={() => this.onMouseOut (entityId)}
          />
          <div className={spaceClass} />
          {Bool.isTrue (this.props.readonly)
            ? null
            : <Button
                kind="check-button"
                glyph="trash"
                tooltip="Supprimer"
                onClick={() => this.onDeleteEntity (entityId)}
                mouseOver={() => this.onMouseOver (entityId)}
                mouseOut={() => this.onMouseOut (entityId)}
              />}

        </div>
      );
    } else {
      const buttonsClass = this.styles.classNames.compactedButtons;

      return (
        <div className={buttonsClass}>
          <Button
            kind="check-button"
            glyph="angle-down"
            glyphSize="180%"
            tooltip="Etendre"
            active="false"
            activeColor={
              this.context.theme.palette.recurrenceExtendedBoxBackground
            }
            onClick={() => this.onSwapExtended (entityId)}
            mouseOver={() => this.onMouseOver (entityId)}
            mouseOut={() => this.onMouseOut (entityId)}
          />
        </div>
      );
    }
  }

  renderRowContent (entityId, extended, index) {
    const rowClass = extended
      ? this.hoverId === entityId
          ? this.styles.classNames.extendedHoverRow
          : this.styles.classNames.extendedRow
      : this.styles.classNames.compactedRow;

    return (
      <Container kind="row-draggable" key={index}>
        <div className={rowClass}>
          {this.renderItem (entityId, extended, index)}
          {this.renderButtons (entityId, extended)}
        </div>
      </Container>
    );
  }

  renderRow (entityId, extended, dragEnabled, index) {
    if (dragEnabled) {
      return (
        <DragCab
          key={index}
          dragController={this.props.id}
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
          {this.renderRowContent (entityId, extended, index)}
        </DragCab>
      );
    } else {
      return this.renderRowContent (entityId, extended, index);
    }
  }

  renderRows () {
    const entityIds = this.props.entityIds.toArray ();
    const dragEnabled =
      !Bool.isTrue (this.props.readonly) && entityIds.length > 1;
    let index = 0;
    return entityIds.map (entityId => {
      const extended = entityId === this.props.extendedId;
      return this.renderRow (entityId, extended, dragEnabled, index++);
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
