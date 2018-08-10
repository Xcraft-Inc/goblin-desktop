import React from 'react';
import Widget from 'laboratory/widget';
import View from 'laboratory/view';
import Container from 'gadgets/container/widget';
import Board from 'desktop/board/widget';
import Wizard from 'desktop/wizard/widget';

class BoardView extends View {
  render() {
    const {workitemId, dialogId} = this.props;
    if (!workitemId) {
      return null;
    }

    const workitem = workitemId.split('@')[0];
    let wireWidget = null;
    let BoardWorkitem = null;
    let WiredDialog = null;

    if (workitem.endsWith('-workitem')) {
      wireWidget = Widget.Wired(Board);
      BoardWorkitem = wireWidget(workitemId);
    }

    if (wireWidget === null || BoardWorkitem === null) {
      return <div>Unable to display {workitemId}</div>;
    }

    if (dialogId) {
      const dialog = dialogId.split('@')[0];
      let wireDialog = null;
      if (dialog.endsWith('-wizard')) {
        wireDialog = Widget.Wired(Wizard);
        WiredDialog = wireDialog(dialogId);
      }
    }

    return (
      <Container kind="row" grow="1" width="100%">
        <Container kind="tickets-root">
          <BoardWorkitem />
          {WiredDialog ? <WiredDialog kind="dialog" /> : null}
        </Container>
      </Container>
    );
  }
}

export default BoardView;
