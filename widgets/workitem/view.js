import React from 'react';
import Widget from 'laboratory/widget';

import Wizard from 'desktop/wizard/widget';
import DataGrid from 'desktop/data-grid/widget';
import DialogModal from 'gadgets/dialog-modal/widget';

import View from 'laboratory/view';
import importer from 'laboratory/importer/';
const viewImporter = importer('view');
class WorkItem extends View {
  constructor() {
    super(...arguments);
  }

  render() {
    const {view, desktopId, wid, did, context} = this.props;

    if (view) {
      const View = viewImporter(view);
      if (!wid) {
        return null;
      }

      return (
        <View
          desktopId={desktopId}
          context={context}
          workitemId={wid}
          dialogId={did}
        />
      );
    } else {
      if (did) {
        let wireDialog = null;
        let WiredDialog = null;
        const dialog = did.split('@')[0];
        if (dialog.endsWith('-wizard')) {
          wireDialog = Widget.Wired(Wizard);
          WiredDialog = wireDialog(did);
        } else if (dialog.endsWith('-datagrid')) {
          wireDialog = Widget.Wired(DataGrid);
          WiredDialog = wireDialog(did);
        }
        return <WiredDialog kind="dialog" />;
      } else {
        return null;
      }
    }
  }
}

export default WorkItem;
