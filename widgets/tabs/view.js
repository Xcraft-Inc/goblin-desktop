//T:2019-02-27
import React from 'react';
import Widget from 'laboratory/widget';
import Tabs from 'desktop/tabs/widget';

class TabsView extends Widget {
  constructor() {
    super(...arguments);
  }

  render() {
    const {isDisplayed, desktopId, context} = this.props;
    if (!isDisplayed) {
      return null;
    }
    return <Tabs id={`tabs@${desktopId}`} context={context} />;
  }
}

export default TabsView;
