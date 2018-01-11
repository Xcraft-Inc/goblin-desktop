import React from 'react';
import Widget from 'laboratory/widget';
import importer from 'laboratory/importer/';
import Workitem from 'desktop/workitem/widget';
import {actions} from 'react-redux-form/immutable';

const uiImporter = importer ('ui');

class Editor extends Widget {
  constructor () {
    super (...arguments);
    this.doProxy = this.doProxy.bind (this);
  }

  static get wiring () {
    return {
      id: 'id',
      entityId: 'entityId',
      firstFieldToFocus: 'firstFieldToFocus',
    };
  }

  doProxy (action, args) {
    const workitem = this.props.id.split ('@')[0];
    this.doAs (workitem, action, args);
  }

  render () {
    const {id, entityId} = this.props;
    if (!id) {
      return null;
    }
    if (!entityId) {
      return null;
    }

    const workitem = this.props.id.split ('@')[0];

    const workitemUI = uiImporter (workitem);
    let EditorUI = this.WithState (workitemUI.panel.edit, 'entityId') (
      '.entityId'
    );
    if (
      workitemUI.mappers &&
      workitemUI.mappers.panel &&
      workitemUI.mappers.panel.edit
    ) {
      EditorUI = this.mapWidget (
        EditorUI,
        workitemUI.mappers.panel.edit,
        `backend.${entityId}`
      );
    }
    return (
      <Workitem kind="editor" id={this.props.id} entityId={this.props.entityId}>
        <EditorUI
          {...this.props}
          theme={this.context.theme}
          do={this.doProxy}
        />
      </Workitem>
    );
  }
}

export default Editor;
