import React from 'react';
import Widget from 'laboratory/widget';
import Tasks from 'desktop/tasks/widget';

class TasksView extends Widget {
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

export default TasksView;
