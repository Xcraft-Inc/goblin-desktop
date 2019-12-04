import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import View from 'goblin-laboratory/widgets/view';
import Container from 'goblin-gadgets/widgets/container/widget';
import Map from 'goblin-desktop/widgets/map/widget';
import Wizard from 'goblin-desktop/widgets/wizard/widget';

class MapView extends View {
  render() {
    const {workitemId, dialogId} = this.props;
    if (!workitemId) {
      return null;
    }

    const workitem = workitemId.split('@')[0];
    let wireWidget = null;
    let MapWorkitem = null;
    let WiredDialog = null;

    if (workitem.endsWith('-workitem')) {
      wireWidget = Widget.Wired(Map);
      MapWorkitem = wireWidget(workitemId);
    }

    if (wireWidget === null || MapWorkitem === null) {
      return <div>Unable to display {workitemId}</div>;
    }

    if (dialogId) {
      const dialog = dialogId.split('@')[0];
      if (dialog.endsWith('-wizard')) {
        WiredDialog = Wizard;
      } else {
        throw new Error(`${dialog} dialog kind not implemented in MapView`);
      }
    }

    return (
      <Container kind="row" grow="1" width="100%">
        <Container kind="tickets-root">
          <MapWorkitem />
          {WiredDialog ? <WiredDialog id={dialogId} kind="dialog" /> : null}
        </Container>
      </Container>
    );
  }
}

export default MapView;
