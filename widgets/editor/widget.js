import React from 'react';
import Widget from 'laboratory/widget';
import importer from 'laboratory/importer/';
import Workitem from 'desktop/workitem/widget';

const uiImporter = importer ('ui');

class Editor extends Widget {
  constructor () {
    super (...arguments);
    this.do = this.do.bind (this);
  }

  static get wiring () {
    return {
      id: 'id',
      entityId: 'entityId',
    };
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
    const EditorUI = this.WithState (workitemUI.edit.full, 'entityId') (
      '.entityId'
    );
    return (
      <Workitem kind="editor" id={this.props.id} entityId={this.props.entityId}>
        <EditorUI {...this.props} do={this.do} />
      </Workitem>
    );
  }
}

export default Editor;
