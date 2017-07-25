import React from 'react';
import Widget from 'laboratory/widget';
import Tasks from 'desktop/taskbar/widget';

class TaskbarView extends Widget {
  constructor () {
    super (...arguments);
  }

  render () {
    const {isDisplayed, context} = this.props;

    if (!isDisplayed) {
      return null;
    }
    const WiredTasks = Widget.Wired (Tasks) (`tasks@${context}`);
    return <WiredTasks />;
  }
}

export default TaskbarView;
