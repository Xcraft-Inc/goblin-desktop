import React from 'react';
import importer from 'laboratory/importer/';
import Widget from 'laboratory/widget';
import Container from 'gadgets/container/widget';
import Button from 'gadgets/button/widget';

const tasksImporter = importer ('tasks');
class Taskbar extends Widget {
  constructor () {
    super (...arguments);
  }

  static get wiring () {
    return {
      id: 'id',
      context: 'context',
    };
  }

  render () {
    const {id, context} = this.props;
    if (!id) {
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
              onClick={() =>
                this.do ('run', {
                  workitem: task.workitem,
                  contextId: context,
                })}
            />
          );
        })}
      </Container>
    );
  }
}

export default Taskbar;
