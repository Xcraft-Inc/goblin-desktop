//T:2019-02-27

import React from 'react';
import importer from 'goblin_importer';
import View from 'goblin-laboratory/widgets/view';
import Container from 'goblin-gadgets/widgets/container/widget';
import Editor from 'goblin-desktop/widgets/editor/widget';
import Search from 'goblin-desktop/widgets/search/widget';
import Datagrid from 'goblin-desktop/widgets/datagrid/widget';
import Wizard from 'goblin-desktop/widgets/wizard/widget';
import WorkitemDialog from 'goblin-desktop/widgets/workitem-dialog/widget';

const viewImporter = importer('view');

class DefaultView extends View {
  render() {
    const {workitemId, dialogId, desktopId, context} = this.props;
    if (!workitemId && !dialogId) {
      return null;
    }

    let LeftPanel = null;
    let WiredDialog = null;

    if (workitemId) {
      const workitem = workitemId.split('@')[0];

      if (workitem.endsWith('-workitem')) {
        LeftPanel = Editor;
      } else if (workitem.endsWith('-search')) {
        LeftPanel = Search;
      } else if (workitem.endsWith('-datagrid')) {
        LeftPanel = Datagrid;
      } else if (workitem.endsWith('-wizard')) {
        LeftPanel = Wizard;
      } else {
        throw new Error(`${workitem} kind not implemented in default view`);
      }
    }

    if (dialogId) {
      const dialog = dialogId.split('@')[0];
      if (dialog.endsWith('-wizard')) {
        WiredDialog = Wizard;
      } else if (dialog.endsWith('-datagrid')) {
        WiredDialog = Datagrid;
      } else if (dialog.endsWith('-workitem')) {
        WiredDialog = WorkitemDialog;
      } else {
        throw new Error(
          `${dialog} dialog kind not implemented in default view`
        );
      }
    }

    const DetailView = viewImporter('detail');
    const HinterView = viewImporter('hinter');
    return (
      <Container kind="views">
        {WiredDialog ? <WiredDialog id={dialogId} kind="dialog" /> : null}
        {LeftPanel ? <LeftPanel id={workitemId} /> : null}
        <Container kind="row" grow="1">
          <HinterView desktopId={desktopId} context={context} />
        </Container>
        <DetailView desktopId={desktopId} context={context} />
      </Container>
    );
  }
}

export default DefaultView;
