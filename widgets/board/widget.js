//T:2019-02-27
import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import stateMapperToProps from 'goblin-laboratory/widgets/state-mapper-to-props/widget.js';
import importer from 'goblin_importer';
import Workitem from 'goblin-desktop/widgets/workitem/widget';

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
    const mapper = workitemUI.mappers && workitemUI.mappers.board;
    const EditorUI = stateMapperToProps(
      workitemUI.board,
      mapper,
      `backend.${entityId}`
    );

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

export default Widget.Wired(Board);
