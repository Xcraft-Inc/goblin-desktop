import React from 'react';
import Widget from 'laboratory/widget';
import Taskbar from 'desktop/taskbar/widget';

class TaskbarView extends Widget {
  constructor () {
    super (...arguments);
  }

  render () {
    const {isDisplayed, context, desktopId} = this.props;

    if (!isDisplayed) {
      return null;
    }
    const WiredTaskbar = Widget.Wired (Taskbar) (
      `${context}-taskbar@${desktopId}`
    );
    return <WiredTaskbar />;
  }
}

export default TaskbarView;
