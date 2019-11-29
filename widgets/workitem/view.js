//T:2019-02-27

import React from 'react';

import Wizard from 'desktop/wizard/widget';
import Datagrid from 'desktop/datagrid/widget';
import WorkitemDialog from 'desktop/workitem-dialog/widget';

import View from 'laboratory/view';
import importer from 'goblin_importer';
import T from 't';

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
        let WiredDialog = null;
        if (did) {
          const dialog = did.split('@')[0];
          if (dialog.endsWith('-wizard')) {
            WiredDialog = Wizard;
          } else if (dialog.endsWith('-datagrid')) {
            WiredDialog = Datagrid;
          } else if (dialog.endsWith('-workitem')) {
            WiredDialog = WorkitemDialog;
          } else {
            throw new Error(
              `${dialog} dialog kind not implemented in WorkItem`
            );
          }
        }
        return <WiredDialog id={did} kind="dialog" />;
      } else {
        return null;
      }
    }
  }
}

export default WorkItem;
