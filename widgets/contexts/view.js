//T:2019-02-27
import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import Contexts from 'goblin-desktop/widgets/contexts/widget';
const WiredContexts = Widget.Wired(Contexts);

class ContextsView extends Widget {
  constructor() {
    super(...arguments);
  }

  render() {
    const {isDisplayed, desktopId} = this.props;
    if (!isDisplayed) {
      return null;
    }
    return <WiredContexts id={`contexts@${desktopId}`} />;
  }
}

export default ContextsView;
