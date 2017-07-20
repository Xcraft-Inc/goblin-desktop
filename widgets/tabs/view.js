import React from 'react';
import Widget from 'laboratory/widget';
import Tabs from 'desktop/tabs/widget';

const wireTabs = Widget.Wired (Tabs);

class TabsView extends Widget {
  constructor () {
    super (...arguments);
  }

  render () {
    const {isDisplayed, desktopId, context} = this.props;
    if (!isDisplayed) {
      return null;
    }
    const WiredTabs = wireTabs (`tabs@${desktopId}`);
    return <WiredTabs context={context} />;
  }
}

export default TabsView;
