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
    this.runApp = this.runApp.bind(this);
    this.runWorkitem = this.runWorkitem.bind(this);
  }

  static get wiring() {
    return {
      id: 'id',
    };
  }

  runApp(app) {
    this.do('run-app', {
      app,
    });
  }

  runClientQuest(clientQuest) {
    this.do('run-client-quest', {
      clientQuest,
    });
  }

  runWorkitem(workitem, context) {
    this.do('run-workitem', {
      workitem,
      context,
    });
  }

  renderButton(context, task, index) {
    if (task.workitem) {
      const runWorkitem = () => this.runWorkitem(task.workitem, task.context);
      return (
        <Button
          key={index}
          kind="task-bar"
          text={task.text}
          glyph={task.glyph}
          tooltip={task.workitem.description}
          onClick={runWorkitem}
        />
      );
    }
    if (task.app) {
      const runApp = () => this.runApp(task.app);
      return (
        <Button
          key={index}
          kind="task-bar"
          text={task.text}
          glyph={task.glyph}
          tooltip={task.app.description}
          onClick={runApp}
        />
      );
    }
    if (task.clientQuest) {
      const runClientQuest = () =>
        this.runClientQuest({labId: window.labId, ...task.clientQuest});
      return (
        <Button
          key={index}
          kind="task-bar"
          text={task.text}
          glyph={task.glyph}
          tooltip={task.clientQuest.description}
          onClick={runClientQuest}
        />
      );
    }
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

    const navigatingStyle = {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    };
    if (this.props.working) {
      navigatingStyle.pointerEvents = 'none';
    }

    return (
      <div style={navigatingStyle}>
        <Container kind="task-bar">
          {contextTasks.map((task, i) => {
            let isValidScope = true;
            if (task.scope) {
              switch (task.scope) {
                case 'prototype':
                  if (!this.props.prototypeMode) {
                    isValidScope = false;
                  }
                  break;
                case 'dev':
                  isValidScope = false;
                  if (
                    this.props.prototypeMode &&
                    process &&
                    process.env &&
                    process.env.NODE_ENV === 'development'
                  ) {
                    isValidScope = true;
                  }
                  break;
                default:
                  break;
              }
            }
            if (isValidScope) {
              if (task.separator) {
                return this.renderSeparator(i);
              } else {
                return this.renderButton(context, task, i);
              }
            }
          })}
        </Container>
      </div>
    );
  }
}

export default Widget.connect((state, props) => {
  const userSession = Widget.getUserSession(state);
  const prototypeMode = userSession.get('prototypeMode');
  const working = state.get(`backend.${props.desktopId}.working`);
  const context = state.get(`backend.${props.desktopId}.current.workcontext`);
  return {prototypeMode, working, context};
})(Taskbar);
