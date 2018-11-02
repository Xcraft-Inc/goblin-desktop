import React from 'react';
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

    let WiredDialog = null;

    if (dialogId) {
      const dialog = dialogId.split('@')[0];
      if (dialog.endsWith('-wizard')) {
        WiredDialog = Wizard;
      } else {
        throw new Error(`${dialog} dialog kind not implemented in BoardView`);
      }
    }

    return (
      <Container kind="row" grow="1" width="100%">
        <Container kind="tickets-root">
          <Board id={workitemId} />
          {WiredDialog ? <WiredDialog id={dialogId} kind="dialog" /> : null}
        </Container>
      </Container>
    );
  }
}

export default BoardView;
