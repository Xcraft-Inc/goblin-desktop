import React from 'react';
import Widget from 'laboratory/widget';
import importer from 'laboratory/importer/';
import Workitem from 'desktop/workitem/widget';

const uiImporter = importer('ui');

class Board extends Widget {
  constructor() {
    super(...arguments);
    this.doProxy = this.doProxy.bind(this);
  }

  static get wiring() {
    return {
      id: 'id',
      entityId: 'entityId',
      layout: 'layout',
    };
  }

  doProxy(action, args) {
    const workitem = this.props.id.split('@')[0];
    this.doAs(workitem, action, args);
  }

  render() {
    const {id, entityId} = this.props;
    if (!id) {
      return null;
    }
    if (!entityId) {
      return null;
    }

    const workitem = this.props.id.split('@')[0];

    const workitemUI = uiImporter(workitem);
    let EditorUI = this.WithState(workitemUI.board, 'entityId')('.entityId');
    if (workitemUI.mappers && workitemUI.mappers.board) {
      EditorUI = this.mapWidget(
        EditorUI,
        workitemUI.mappers.board,
        `backend.${entityId}`
      );
    }
    return (
      <Workitem
        kind="board"
        id={this.props.id}
        entityId={this.props.entityId}
        dragServiceId={this.props.dragServiceId}
      >
        <EditorUI
          {...this.props}
          theme={this.context.theme}
          do={this.doProxy}
        />
      </Workitem>
    );
  }
}

export default Widget.Wired(Board)();
