//T:2019-02-27
import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import StateLoader from 'goblin-laboratory/widgets/state-loader/widget';
import stateMapperToProps from 'goblin-laboratory/widgets/state-mapper-to-props/widget.js';
import importer from 'goblin_importer';
import Workitem from 'goblin-desktop/widgets/workitem/widget';

const uiImporter = importer('ui');

const WorkitemConnected = Widget.connectBackend((state, props) => {
  return {buttons: state.get('buttons')};
})(Workitem);

class Editor extends Widget {
  constructor() {
    super(...arguments);
    this.doProxy = this.doProxy.bind(this);
  }

  static get wiring() {
    return {
      id: 'id',
      entityId: 'entityId',
      firstFieldToFocus: 'firstFieldToFocus',
      width: 'width',
    };
  }

  doProxy(action, args) {
    const workitem = this.props.id.split('@')[0];
    this.doAs(workitem, action, args);
  }

  render() {
    const {id, entityId, readonly, dragServiceId} = this.props;
    if (!id) {
      return null;
    }
    if (!entityId) {
      return null;
    }
    const type = entityId.split('@', 1)[0];
    let defaultPanel = 'edit';
    if (readonly) {
      defaultPanel = 'readonly';
    }
    const workitem = id.split('@')[0];
    const workitemUI = uiImporter(workitem);
    const mapper =
      workitemUI.mappers &&
      workitemUI.mappers.panel &&
      workitemUI.mappers.panel[defaultPanel];
    const EditorUI = stateMapperToProps(
      workitemUI.panel[defaultPanel],
      mapper,
      `backend.${entityId}`
    );

    return (
      <StateLoader path={entityId}>
        <WorkitemConnected
          kind="editor"
          id={id}
          readonly={readonly || false}
          entityId={entityId}
          dragServiceId={dragServiceId}
        >
          <EditorUI
            {...this.props}
            theme={this.context.theme}
            do={this.doProxy}
            entitySchema={this.getSchema(type)}
            contextId={this.context.contextId}
          />
        </WorkitemConnected>
      </StateLoader>
    );
  }
}

export default Widget.Wired(Editor);
