import React from 'react';
import View from 'laboratory/view';
import importer from 'laboratory/importer/';
const viewImporter = importer('view');
class WorkItem extends View {
  constructor() {
    super(...arguments);
  }

  render() {
    const {view, desktopId, wid, did, context} = this.props;

    if (!view) {
      return null;
    }

    if (!wid) {
      return null;
    }

    const View = viewImporter(view);
    return (
      <View
        desktopId={desktopId}
        context={context}
        workitemId={wid}
        dialogId={did}
      />
    );
  }
}

export default WorkItem;
