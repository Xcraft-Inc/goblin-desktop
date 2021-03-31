import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import Container from 'goblin-gadgets/widgets/container/widget.js';
import Wizard from 'goblin-desktop/widgets/wizard/widget';

class TabContent extends Widget {
  render() {
    const {workitemId, dialogId} = this.props;

    let WiredDialog = null;

    if (dialogId) {
      const dialog = dialogId.split('@')[0];
      if (dialog.endsWith('-wizard')) {
        WiredDialog = Wizard;
      } else {
        throw new Error(
          `${dialog} dialog kind not implemented in William Debt Explorer`
        );
      }
    }
    if (!this.props.content) {
      throw new Error(`You must provide a React component to inject`);
    }
    const Content = this.props.content;
    return (
      <Container kind="view" width="100%">
        <Content id={workitemId} />
        {WiredDialog ? <WiredDialog id={dialogId} kind="dialog" /> : null}
      </Container>
    );
  }
}

export default TabContent;
