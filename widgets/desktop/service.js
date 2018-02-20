'use strict';

const path = require('path');
const Goblin = require('xcraft-core-goblin');
const uuidV4 = require('uuid/v4');
const goblinName = path.basename(module.parent.filename, '.js');

// Default route/view mapping
// /mountpoint/:context/:view/:hinter
const defaultRoutes = {
  tabs: '/before-content/:context',
  workitem: '/content/:context/:view',
  hinter: '/hinter/:context/:view/:hinter',
  taskbar: '/task-bar/:context',
  contexts: '/top-bar/',
};

// Define initial logic values
const logicState = {};

let nextNotificationOrder = 0;

// Define logic handlers according rc.json
const logicHandlers = {
  create: (state, action) => {
    const id = action.get('id');
    return state.set('', {
      id: id,
      username: action.get('username', 'guest'),
      routes: action.get('routes'),
      showNotifications: 'false',
      dnd: 'false',
      onlyNews: 'false',
      notReadCount: 0,
      notifications: {},
      current: {
        workitems: {},
      },
    });
  },
  'add-context': (state, action) => {
    return state.set('current.workcontext', action.get('contextId'));
  },
  'toggle-dnd': state => {
    return state.set('dnd', state.get('dnd') === 'false' ? 'true' : 'false');
  },
  'toggle-only-news': state => {
    return state.set(
      'onlyNews',
      state.get('onlyNews') === 'false' ? 'true' : 'false'
    );
  },
  'toggle-notifications': (state, action) => {
    return state.set('showNotifications', action.get('showValue'));
  },
  'add-notification': (state, action) => {
    const notificationId = action.get('notificationId');
    const notification = {
      id: notificationId,
      order: nextNotificationOrder++,
      command: action.get('command'),
      status: 'not-read',
      glyph: action.get('glyph'),
      color: action.get('color'),
      message: action.get('message'),
    };
    return state.set(`notifications.${notificationId}`, notification);
  },
  'update-not-read-count': state => {
    const notifications = state.get('notifications').select((i, v) => v.toJS());
    const count = notifications.reduce((acc, n) => {
      if (n.status === 'not-read') {
        return acc + 1;
      }
      return acc;
    }, 0);
    return state.set('notReadCount', count);
  },
  'read-all': state => {
    const notifications = state.get('notifications');
    const newNotifications = notifications.transform(
      i => i,
      (i, v) => v.set('status', 'read')
    );
    return state.set('notifications', newNotifications);
  },
  'remove-notification': (state, action) => {
    const id = action.get('notification').id;
    return state.del(`notifications.${id}`);
  },
  'remove-notifications': state => {
    return state.set(`notifications`, {});
  },
  'nav-to-context': (state, action) => {
    return state.set('current.workcontext', action.get('contextId'));
  },
  'add-workitem': (state, action) => {
    return state.set(`workitems.${action.get('widgetId')}`, {
      tabId: action.get('tabId'),
    });
  },
  'remove-workitem': (state, action) => {
    return state.del(`workitems.${action.get('widgetId')}`);
  },
  setCurrentWorkitemByContext: (state, action) => {
    const lastWorkcontext = state.get('current.workcontext');
    const lastWorkitem = state.get(`current.workitems.${lastWorkcontext}`);
    const lastView = state.get(`current.views.${lastWorkcontext}`);

    return state
      .set('current.workcontext', action.get('contextId'))
      .set(
        `current.workitems.${action.get('contextId')}`,
        action.get('workitemId')
      )
      .set(`current.views.${action.get('contextId')}`, action.get('view'))
      .set('last', {
        workcontext: lastWorkcontext,
        workitem: lastWorkitem,
        view: lastView,
      });
  },
};

// Register quest's according rc.json
Goblin.registerQuest(goblinName, 'create', function(
  quest,
  labId,
  username,
  configuration
) {
  if (!labId) {
    throw new Error('Missing labId');
  }

  quest.goblin.setX('labId', labId);
  quest.goblin.setX('configuration', configuration);

  // CREATE DEFAULT CONTEXT MANAGER
  quest.create('contexts', {
    id: `contexts@${quest.goblin.id}`,
    desktopId: quest.goblin.id,
  });

  // CREATE DEFAULT TABS MANAGER
  quest.create('tabs', {
    id: `tabs@${quest.goblin.id}`,
    desktopId: quest.goblin.id,
  });

  quest.do({id: quest.goblin.id, routes: defaultRoutes});

  quest.log.info(`Desktop ${quest.goblin.id} created!`);
  return quest.goblin.id;
});

Goblin.registerQuest(goblinName, 'create-hinter-for', function*(
  quest,
  workitemId,
  detailWidget,
  detailKind,
  detailWidth,
  newButtonTitle,
  newWorkitem,
  usePayload,
  name,
  type,
  title,
  glyph,
  kind
) {
  const serviceName = name ? name : type;
  const widgetId = workitemId ? `${serviceName}-hinter@${workitemId}` : null;

  if (!type) {
    throw new Error('Hinter type required');
  }

  if (!kind) {
    kind = 'list';
  }

  if (!title) {
    title = type;
  }

  let goblinName = Goblin.getGoblinName(workitemId);

  const hinter = yield quest.createFor(
    goblinName,
    workitemId,
    `hinter@${widgetId}`,
    {
      id: widgetId,
      name,
      type,
      desktopId: quest.goblin.id,
      title,
      glyph,
      kind,
      detailWidget,
      detailKind,
      detailWidth,
      newButtonTitle,
      newWorkitem,
      usePayload,
    }
  );

  return hinter.id;
});

Goblin.registerQuest(goblinName, 'clean-workitem', function(quest, workitemId) {
  quest.dispatch('remove-workitem', {widgetId: workitemId});
});

Goblin.registerQuest(goblinName, 'remove-workitem', function*(
  quest,
  workitem,
  close
) {
  const desk = quest.me;
  if (!workitem.id) {
    throw new Error(
      `Cannot remove workitem without an id: ${JSON.stringify(workitem)}`
    );
  }
  if (!workitem.name) {
    throw new Error(
      `Cannot remove workitem without a name: ${JSON.stringify(workitem)}`
    );
  }
  const widgetId = `${workitem.name}@${workitem.id}`;

  // Remove the tab
  const tabId = quest.goblin.getState().get(`workitems.${widgetId}.tabId`);
  yield desk.removeTab({
    workitemId: widgetId,
    contextId: workitem.contextId,
    tabId,
    navToLastWorkitem: true,
    close,
  });

  quest.do({widgetId});

  if (close) {
    quest.cmd(`${workitem.name}.close`, {
      id: widgetId,
    });
  }

  quest.evt(`${widgetId}.workitem.closed`);
});

Goblin.registerQuest(goblinName, 'add-workitem', function*(
  quest,
  workitem,
  navigate
) {
  const desk = quest.me;
  if (!workitem.id) {
    throw new Error(
      `Cannot add workitem without an id: ${JSON.stringify(workitem)}`
    );
  }
  if (!workitem.name) {
    throw new Error(
      `Cannot add workitem without a name: ${JSON.stringify(workitem)}`
    );
  }
  if (workitem.isDone) {
    return;
  }

  if (!workitem.contextId) {
    const state = quest.goblin.getState();
    workitem.contextId = state.get(`current.workcontext`, null);
  }

  //Manage collision with desktopId
  if (workitem.payload) {
    if (workitem.payload.desktopId) {
      workitem.payload.deskId = workitem.payload.desktopId;
      delete workitem.payload.desktopId;
    }
  }

  /* Manage `maxInstances` property which is useful to limit the quantity
   * of instances. If the `navigate` property is passed to true, then
   * a navigate is performed with the first entry.
   */
  if (Number.isInteger(workitem.maxInstances)) {
    const workitems = quest.goblin.getState().get(`workitems`);
    if (workitems) {
      const items = workitems.filter((v, k) =>
        k.startsWith(`${workitem.name}@`)
      );

      if (items.count() >= workitem.maxInstances) {
        if (workitem.navigate) {
          desk.navToWorkitem({
            contextId: workitem.contextId,
            view: workitem.view,
            workitemId: items.keySeq().first(),
          });
        }
        return;
      }
    }
  }

  const widgetId = `${workitem.name}@${workitem.id}`;
  yield quest.create(
    widgetId,
    Object.assign(
      {
        id: widgetId,
        desktopId: quest.goblin.id,
        contextId: workitem.contextId,
        workflowId: workitem.workflowId,
      },
      workitem.payload,
      {payload: workitem.payload}
    )
  );

  switch (workitem.kind) {
    default:
      break;
    case 'tab': {
      const tabId = yield desk.addTab({
        workitemId: widgetId,
        view: workitem.view,
        contextId: workitem.contextId,
        name: workitem.description,
        glyph: workitem.icon,
        closable: true,
        navigate: !!navigate,
      });
      quest.do({widgetId, tabId});
      break;
    }
  }

  quest.evt(`workitem.added`, {
    desktopId: quest.goblin.id,
    workitemId: widgetId,
  });

  return widgetId;
});

Goblin.registerQuest(goblinName, 'add-context', function(
  quest,
  contextId,
  name
) {
  const contexts = quest.getAPI('contexts');
  contexts.add({
    contextId,
    name,
  });
  quest.do();
});

Goblin.registerQuest(goblinName, 'add-tab', function*(
  quest,
  name,
  contextId,
  view,
  workitemId,
  closable,
  glyph,
  navigate
) {
  const state = quest.goblin.getState();
  if (!contextId) {
    contextId = state.get(`current.workcontext`, null);
  }
  if (!view) {
    view = contextId;
  }

  const workitem = state.get(`current.workitems.${contextId}`, null);
  if (!workitem) {
    quest.dispatch('setCurrentWorkitemByContext', {
      contextId,
      view,
      workitemId,
    });
  }
  const tabs = quest.getAPI('tabs');
  const tabId = yield tabs.add({
    name,
    contextId,
    view,
    workitemId,
    glyph,
    closable: closable || false,
  });

  if (navigate) {
    quest.cmd('desktop.nav-to-workitem', {
      id: quest.goblin.id,
      contextId,
      view,
      workitemId,
    });
  }
  return tabId;
});

Goblin.registerQuest(goblinName, 'remove-tab', function*(
  quest,
  contextId,
  workitemId,
  tabId,
  navToLastWorkitem,
  close
) {
  const tabs = quest.getAPI('tabs');
  yield tabs.remove({
    tabId,
    contextId,
    workitemId,
    navToLastWorkitem,
    close,
  });
});

Goblin.registerQuest(goblinName, 'change-theme', function(quest, name) {
  quest.evt(`change-theme.requested`, {
    name,
  });
});

Goblin.registerQuest(goblinName, 'nav-to-context', function(quest, contextId) {
  const state = quest.goblin.getState();
  const view = state.get(`current.views.${contextId}`, null);
  let route;

  if (view) {
    const workItem = state.get(`current.workitems.${contextId}`, null);
    if (workItem) {
      route = `/${contextId}/${view}?wid=${workItem}`;
    } else {
      route = `/${contextId}/${view}`;
    }
  } else {
    route = `/${contextId}`;
  }
  quest.evt(`nav.requested`, {
    route,
  });

  quest.do();
});

Goblin.registerQuest(goblinName, 'nav-to-workitem', function(
  quest,
  contextId,
  view,
  workitemId,
  skipNav
) {
  if (!contextId) {
    contextId = quest.goblin.GetState().get(`current.workcontext`, null);
  }
  quest.dispatch('setCurrentWorkitemByContext', {contextId, view, workitemId});
  const tabs = quest.getAPI('tabs');
  tabs.setCurrent({contextId, workitemId});
  if (skipNav) {
    return;
  }
  quest.evt(`nav.requested`, {
    route: `/${contextId}/${view}?wid=${workitemId}`,
  });
});

Goblin.registerQuest(goblinName, 'nav-to-last-workitem', function(quest) {
  const last = quest.goblin.getState().get('last');
  const contextId = last.get('workcontext');
  const view = last.get('view');
  const workitemId = last.get('workitem');

  quest.dispatch('setCurrentWorkitemByContext', {contextId, view, workitemId});
  const tabs = quest.getAPI('tabs');
  tabs.setCurrent({contextId, workitemId});
  quest.evt(`nav.requested`, {
    route: `/${contextId}/${view}?wid=${workitemId}`,
  });
});

Goblin.registerQuest(goblinName, 'clear-workitem', function(quest, contextId) {
  quest.dispatch('setCurrentWorkitemByContext', {
    contextId,
    view: null,
    workitemId: null,
  });
  quest.evt(`nav.requested`, {
    route: `/${contextId}/?wid=null`,
  });
});

Goblin.registerQuest(goblinName, 'dispatch', function(quest, action) {
  quest.evt(`dispatch.requested`, {
    action,
  });
});

Goblin.registerQuest(goblinName, 'add-notification', function(
  quest,
  notificationId,
  glyph,
  color,
  message,
  command
) {
  if (!notificationId) {
    notificationId = uuidV4();
  }
  quest.do({notificationId, glyph, color, message, command});
  const dnd = quest.goblin.getState().get('dnd');
  if (dnd !== 'true') {
    quest.dispatch('toggle-notifications', {showValue: 'true'});
  }
  quest.dispatch('update-not-read-count');
  return quest.goblin
    .getState()
    .get(`notifications.${notificationId}`, null)
    .toJS();
});

Goblin.registerQuest(goblinName, 'remove-notification', function(
  quest,
  notification
) {
  quest.do({notification});
  quest.dispatch('update-not-read-count');
});

Goblin.registerQuest(goblinName, 'remove-notifications', function(quest) {
  quest.do();
  quest.dispatch('update-not-read-count');
});

Goblin.registerQuest(goblinName, 'click-notification', function(
  quest,
  notification
) {
  if (notification.command) {
    quest.cmd(notification.command, {notification});
  }
});

Goblin.registerQuest(goblinName, 'toggle-dnd', function(quest) {
  quest.do();
});

Goblin.registerQuest(goblinName, 'toggle-only-news', function(quest) {
  quest.do();
});

Goblin.registerQuest(goblinName, 'toggle-notifications', function(quest) {
  const state = quest.goblin.getState();
  const showValue =
    state.get('showNotifications') === 'false' ? 'true' : 'false';
  quest.do({showValue});
  if (showValue === 'false') {
    quest.dispatch('read-all');
  }
  quest.dispatch('update-not-read-count');
});

Goblin.registerQuest(goblinName, 'change-mandate', function(quest) {
  quest.evt(`mandate.changed`);
});

Goblin.registerQuest(goblinName, 'change-screen', function(quest) {
  quest.evt(`screen.changed`);
});

Goblin.registerQuest(goblinName, 'get-configuration', function(quest) {
  const conf = quest.goblin.getX('configuration');
  return conf;
});

Goblin.registerQuest(goblinName, 'get-user-info', function(quest) {
  return quest.goblin.getState().get('username');
});

Goblin.registerQuest(goblinName, 'delete', function(quest) {
  quest.log.info('Deleting desktop...');
});

// Create a Goblin with initial state and handlers
module.exports = Goblin.configure(goblinName, logicState, logicHandlers);
