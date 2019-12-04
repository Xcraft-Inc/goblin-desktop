import React from 'react';
import View from 'goblin-laboratory/widgets/view';
import Container from 'goblin-gadgets/widgets/container/widget';
import EntityList from 'goblin-desktop/widgets/entity-list/widget';
import Wizard from 'goblin-desktop/widgets/wizard/widget';
import Datagrid from 'goblin-desktop/widgets/datagrid/widget';

export default class EntityListView extends View {
  render() {
    const {workitemId, dialogId} = this.props;
    let WiredDialog = null;

    if (!workitemId) {
      return null;
    }

    if (dialogId) {
      const dialog = dialogId.split('@')[0];
      if (dialog.endsWith('-wizard')) {
        WiredDialog = Wizard;
      } else if (dialog.endsWith('-datagrid')) {
        WiredDialog = Datagrid;
      } else {
        throw new Error(
          `${dialog} dialog kind not implemented in default view`
        );
      }
    }
    return (
      <Container kind="views">
        {WiredDialog ? <WiredDialog id={dialogId} kind="dialog" /> : null}
        <EntityList id={workitemId} />
      </Container>
    );
  }
}
