import React from 'react';
import Widget from 'laboratory/widget';
import importer from 'laboratory/importer/';
const viewImporter = importer ('view');
class WorkItem extends Widget {
  constructor () {
    super (...arguments);
  }

  render () {
    const {view, desktopId, wid} = this.props;

    if (!view) {
      return null;
    }

    const View = viewImporter (view);
    return <View desktopId={desktopId} workitemId={wid} />;
  }
}

export default WorkItem;
