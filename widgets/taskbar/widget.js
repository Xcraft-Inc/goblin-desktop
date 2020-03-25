//T:2019-02-27
import React from 'react';
import importer from 'goblin_importer';
import Widget from 'goblin-laboratory/widgets/widget';

import Container from 'goblin-gadgets/widgets/container/widget';
import Button from 'goblin-gadgets/widgets/button/widget';
import Separator from 'goblin-gadgets/widgets/separator/widget';

const tasksImporter = importer('tasks');
class Taskbar extends Widget {
  constructor() {
    super(...arguments);
  }

  static get wiring() {
    return {
      id: 'id',
      context: 'context',
    };
  }

  renderButton(context, task, index) {
    return (
      <Button
        key={index}
        kind="task-bar"
        text={task.text}
        glyph={task.glyph}
        tooltip={task.workitem.description}
        onClick={() =>
          this.do('run', {
            workitem: task.workitem,
            contextId: context,
          })
        }
      />
    );
  }

  renderSeparator(index) {
    return <Separator key={index} kind="task" />;
  }

  render() {
    const {id, context} = this.props;
    if (!id) {
      return null;
    }
    const contextTasks = tasksImporter(context);
    if (!contextTasks) {
      return null;
    }
    return (
      <Container kind="task-bar">
        {contextTasks.map((task, i) => {
          if (task.separator) {
            return this.renderSeparator(i);
          } else {
            return this.renderButton(context, task, i);
          }
        })}
      </Container>
    );
  }
}

export default Taskbar;
