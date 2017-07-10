import React from 'react';
import importer from 'laboratory/importer/';
import Widget from 'laboratory/widget';
import Container from 'gadgets/container/widget';
import Button from 'gadgets/button/widget';

const tasksImporter = importer ('tasks');
class Tasks extends Widget {
  constructor (props, context) {
    super (props, context);
  }

  doQuest (quest, desktopId) {
    this.cmd (quest, {desktopId});
  }

  render () {
    const {isDisplayed, context, desktopId} = this.props;

    if (!isDisplayed) {
      return null;
    }

    const contextTasks = tasksImporter (context);
    if (!contextTasks) {
      return null;
    }
    return (
      <Container kind="task-bar">
        {contextTasks.map ((task, i) => {
          return (
            <Button
              kind="task-bar"
              key={i}
              text={task.text}
              glyph={task.glyph}
              onClick={() => this.doQuest (task.quest, desktopId)}
            />
          );
        })}
      </Container>
    );
  }
}

export default Tasks;
