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
            onClick={this.onCreateEntity}
          />
        </div>
      );
    }
  }

  renderRow (entityId, extended, index) {
    const workitemUI = uiImporter (this.props.editorWidget);
    const ReadLineUI = this.WithState (workitemUI.read.line, 'entityId') (
      '.entityId'
    );
    const EditLineUI = this.WithState (workitemUI.edit.line, 'entityId') (
      '.entityId'
    );

    const workitemId = `${this.props.editorWidget}@${this.props.entityIds.get (index)}`;

    if (extended) {
      return (
        <Container kind="pane" key={index}>
          <Container kind="row-pane">
            <Button
              height={this.context.theme.shapes.lineHeight}
              glyph="trash"
              tooltip="Supprimer"
              onClick={() => this.onDeleteEntity (entityId)}
            />
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

          </Container>
          <Container kind="row-pane">
            <Container kind="column">
              <Workitem id={workitemId} entityId={entityId} kind="form">
                <EditLineUI id={workitemId} entityId={entityId} />
              </Workitem>
            </Container>
          </Container>
        </Container>
      );
    } else {
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

          <Container kind="row-pane">
            <Workitem
              readonly="true"
              id={workitemId}
              entityId={entityId}
              kind="form"
            >
              <ReadLineUI id={workitemId} entityId={entityId} />
            </Workitem>
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
          </Container>

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
      return <div>No editor provided in props!</div>;
    }

    const boxClass = this.styles.classNames.box;

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
