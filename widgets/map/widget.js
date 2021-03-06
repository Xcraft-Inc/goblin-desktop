//T:2019-02-27
import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import importer from 'goblin_importer';
import Workitem from 'goblin-desktop/widgets/workitem/widget';

const uiImporter = importer('ui');

class Map extends Widget {
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
    let EditorUI = this.WithState(workitemUI.map, 'entityId')('.entityId');
    if (workitemUI.mappers && workitemUI.mappers.map) {
      EditorUI = this.mapWidget(
        EditorUI,
        workitemUI.mappers.map,
        `backend.${entityId}`
      );
    }
    return (
      <Workitem
        kind="map"
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

export default Map;
