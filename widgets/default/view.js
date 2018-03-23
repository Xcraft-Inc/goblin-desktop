import React from 'react';
import importer from 'laboratory/importer';
import Widget from 'laboratory/widget';
import View from 'laboratory/view';
import Container from 'gadgets/container/widget';
import Editor from 'desktop/editor/widget';
import Search from 'desktop/search/widget';
import Wizard from 'desktop/wizard/widget';
import DialogModal from 'gadgets/dialog-modal/widget';

const viewImporter = importer('view');
const widgetImporter = importer('widget');

class DefaultView extends View {
  render() {
    const {workitemId, dialogId, desktopId, context} = this.props;
    if (!workitemId && !dialogId) {
      return null;
    }

    let wireWidget = null;
    let LeftPanel = null;
    let wireDialog = null;
    let WiredDialog = null;

    if (workitemId) {
      const workitem = workitemId.split('@')[0];

      if (workitem.endsWith('-workitem')) {
        wireWidget = Widget.Wired(Editor);
        LeftPanel = wireWidget(workitemId);
      }

      if (workitem.endsWith('-search')) {
        wireWidget = Widget.Wired(Search);
        LeftPanel = wireWidget(workitemId);
      }

      if (workitem.endsWith('-wizard')) {
        wireWidget = Widget.Wired(Wizard);
        LeftPanel = wireWidget(workitemId);
      }

      if (wireWidget === null || LeftPanel === null) {
        return <div>Unable to display workitem{workitemId}</div>;
      }
    }

    if (dialogId) {
      const dialog = dialogId.split('@')[0];
      if (dialog.endsWith('-wizard')) {
        wireDialog = Widget.Wired(Wizard);
        WiredDialog = wireDialog(dialogId);
      }

      if (wireDialog === null || WiredDialog === null) {
        return <div>Unable to display dialog {workitemId}</div>;
      }
    }

    const DetailView = viewImporter('detail');
    const HinterView = viewImporter('hinter');
    return (
      <Container kind="views">
        {WiredDialog ? <WiredDialog kind="dialog" /> : null}
        {LeftPanel ? <LeftPanel /> : null}
        <Container kind="row" grow="1">
          <HinterView desktopId={desktopId} context={context} />
        </Container>
        <DetailView desktopId={desktopId} context={context} />
      </Container>
    );
  }
}

export default DefaultView;
