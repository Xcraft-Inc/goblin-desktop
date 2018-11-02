import React from 'react';
import Widget from 'laboratory/widget';
import importer from 'laboratory/importer/';
import Workitem from 'desktop/workitem/widget';

const uiImporter = importer('ui');

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
    let EditorUI = this.WithState(workitemUI.panel.edit, 'entityId')(
      '.entityId'
    );
    if (
      workitemUI.mappers &&
      workitemUI.mappers.panel &&
      workitemUI.mappers.panel.edit
    ) {
      EditorUI = this.mapWidget(
        EditorUI,
        workitemUI.mappers.panel.edit,
        `backend.${entityId}`
      );
    }

    let Editor = this.mapWidget(
      Workitem,
      'status',
      `backend.${entityId}.meta.status`
    );

    Editor = this.mapWidget(Editor, 'buttons', `backend.${id}.buttons`);

    return this.buildLoader(entityId, () => (
      <Editor
        kind="editor"
        id={this.props.id}
        entityId={this.props.entityId}
        dragServiceId={this.props.dragServiceId}
      >
        <EditorUI
          {...this.props}
          theme={this.context.theme}
          do={this.doProxy}
          contextId={this.context.contextId}
        />
      </Editor>
    ));
  }
}

export default Widget.Wired(Editor)();
