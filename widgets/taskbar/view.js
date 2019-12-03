//T:2019-02-27
import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import Taskbar from 'goblin-desktop/widgets/taskbar/widget';

class TaskbarView extends Widget {
  constructor() {
    super(...arguments);
  }

  render() {
    const {isDisplayed, context, desktopId} = this.props;

    if (!isDisplayed) {
      return null;
    }
    const WiredTaskbar = Widget.Wired(Taskbar)(
      `${context}-taskbar@${desktopId}`
    );
    return <WiredTaskbar />;
  }
}

export default TaskbarView;
