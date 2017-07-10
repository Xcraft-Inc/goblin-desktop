import React from 'react';
import Widget from 'laboratory/widget';
import Contexts from 'desktop/contexts/widget';
const wireContexts = Widget.Wired (Contexts);

class ContextsView extends Widget {
  constructor (props, context) {
    super (props, context);
  }

  render () {
    const {isDisplayed, desktopId} = this.props;
    if (!isDisplayed) {
      return null;
    }
    const WiredContexts = wireContexts (`contexts@${desktopId}`);
    return <WiredContexts />;
  }
}

export default ContextsView;
