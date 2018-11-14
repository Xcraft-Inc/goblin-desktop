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

// Define logic handlers according rc.json
const logicHandlers = require('./logicHandlers.js');

// Register quest's according rc.json
Goblin.registerQuest(goblinName, 'create', function*(
  quest,
  labId,
  username,
  configuration,
  routes
) {
  if (!labId) {
    throw new Error('Missing labId');
  }

  quest.goblin.setX('labId', labId);
  quest.goblin.setX('configuration', configuration);

  // CREATE DEFAULT CONTEXT MANAGER
  yield quest.create('contexts', {
    id: `contexts@${quest.goblin.id}`,
    desktopId: quest.goblin.id,
  });

  // CREATE DEFAULT TABS MANAGER
  yield quest.create('tabs', {
    id: `tabs@${quest.goblin.id}`,
    desktopId: quest.goblin.id,
  });

  if (!routes) {
    routes = defaultRoutes;
  }

  quest.do({id: quest.goblin.id, routes});

  quest.log.info(`Desktop ${quest.goblin.id} created!`);
  quest.goblin.defer(
    quest.sub(
      `*::*.${quest.goblin.id.split('@')[1]}.desktop-notification-broadcasted`,
      (err, msg) => {
        quest.me.addNotification({...msg.data});
      }
    )
  );
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
  withDetails,
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
      withDetails,
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
    yield quest.cmd(`${workitem.name}.close`, {
      id: widgetId,
    });
  }
  quest.kill([widgetId]);
  quest.evt(`${widgetId}.workitem.closed`);
});

Goblin.registerQuest(goblinName, 'add-workitem', function*(
  quest,
  workitem,
  navigate
) {
  const desk = quest.me;

  if (!workitem.payload) {
    workitem.payload = {};
  }

  if (workitem.newEntityType) {
    workitem.payload.entityId = `${workitem.newEntityType}@${quest.uuidV4()}`;
  }

  if (!workitem.id) {
    workitem.id = workitem.payload.entityId
      ? workitem.payload.entityId
      : quest.uuidV4();
  }

  if (!workitem.name) {
    throw new Error(
      `Cannot add workitem without a name: ${JSON.stringify(workitem)}`
    );
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

  const desktopId = quest.goblin.id;
  const widgetId = `${workitem.name}${
    workitem.mode ? `@${workitem.mode}` : ''
  }@${desktopId}@${workitem.id}`;
  const workitemAPI = yield quest.create(
    widgetId,
    Object.assign(
      {
        id: widgetId,
        desktopId,
        contextId: workitem.contextId,
        workflowId: workitem.workflowId,
        mode: workitem.mode ? workitem.mode : false,
        level: 1,
      },
      workitem.payload,
      {payload: workitem.payload}
    )
  );

  if (workitemAPI.waitLoaded) {
    yield workitemAPI.waitLoaded();
  }

  switch (workitem.kind) {
    default:
      break;
    case 'tab': {
      const tabId = yield desk.addTab({
        workitemId: widgetId,
        entityId: workitem.payload.entityId,
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
    case 'dialog': {
      yield desk.addDialog({dialogId: widgetId});
      quest.do({widgetId, tabId: null});
      break;
    }
  }

  quest.evt(`workitem.added`, {
    desktopId,
    workitemId: widgetId,
  });

  return widgetId;
});

Goblin.registerQuest(goblinName, 'add-context', function(
  quest,
  contextId,
  name
) {
  const contexts = quest.getAPI(`contexts@${quest.goblin.id}`);
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
  entityId,
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
  const tabs = quest.getAPI(`tabs@${quest.goblin.id}`);
  const tabId = yield tabs.add({
    name,
    contextId,
    view,
    workitemId,
    entityId,
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
  const tabs = quest.getAPI(`tabs@${quest.goblin.id}`);
  yield tabs.remove({
    tabId,
    contextId,
    workitemId,
    navToLastWorkitem,
    close,
  });
});

const buildDialogNavRequest = (state, newArg) => {
  if (!newArg) {
    newArg = '';
  } else {
    newArg = `?${newArg}`;
  }

  const contextId = state.get(`current.workcontext`, null);
  if (!contextId) {
    return `${newArg}`;
  }

  const view = state.get(`current.views.${contextId}`, null);
  if (!view) {
    return `/${contextId}${newArg}`;
  }

  const currentWorkitemId = state.get(`current.workitems.${contextId}`, null);
  if (!currentWorkitemId) {
    return `/${contextId}/${view}${newArg}`;
  }

  if (newArg.startsWith('?')) {
    newArg = `&${newArg.substring(1)}`;
  }
  return `/${contextId}/${view}?wid=${currentWorkitemId}${newArg}`;
};

Goblin.registerQuest(goblinName, 'add-dialog', function(quest, dialogId) {
  const state = quest.goblin.getState();
  quest.evt(`nav.requested`, {
    route: buildDialogNavRequest(state, `did=${dialogId}`),
  });
});

Goblin.registerQuest(goblinName, 'hide-dialogs', function(quest) {
  const state = quest.goblin.getState();
  quest.evt(`nav.requested`, {
    route: buildDialogNavRequest(state),
  });
});

Goblin.registerQuest(goblinName, 'remove-dialog', function(quest, dialogId) {
  const state = quest.goblin.getState();
  quest.evt(`nav.requested`, {
    route: buildDialogNavRequest(state),
  });
  quest.me.cleanWorkitem({workitemId: dialogId});
  quest.kill([dialogId]);
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
  const tabs = quest.getAPI(`tabs@${quest.goblin.id}`);
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
  if (workitemId && view && contextId) {
    quest.dispatch('setCurrentWorkitemByContext', {
      contextId,
      view,
      workitemId,
    });
    const tabs = quest.getAPI(`tabs@${quest.goblin.id}`);
    tabs.setCurrent({contextId, workitemId});
    quest.evt(`nav.requested`, {
      route: `/${contextId}/${view}?wid=${workitemId}`,
    });
  }
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
  command,
  broadcast
) {
  if (!notificationId) {
    notificationId = uuidV4();
  }

  if (broadcast) {
    quest.evt(
      `${quest.goblin.id.split('@')[1]}.desktop-notification-broadcasted`,
      {
        notificationId,
        glyph,
        color,
        message,
        command,
      }
    );
    return;
  }

  quest.do({notificationId, glyph, color, message, command});
  const dnd = quest.goblin.getState().get('dnd');
  if (dnd !== 'true') {
    quest.dispatch('set-notifications', {show: 'true'});
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

Goblin.registerQuest(goblinName, 'set-dnd', function(quest, show) {
  quest.do();
});

Goblin.registerQuest(goblinName, 'set-only-news', function(quest, show) {
  quest.do();
});

Goblin.registerQuest(goblinName, 'set-notifications', function(quest, show) {
  quest.do();
  if (show === 'false') {
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

Goblin.registerQuest(goblinName, 'get-lab-id', function(quest) {
  return quest.goblin.getX('labId');
});

Goblin.registerQuest(goblinName, 'get-workitems', function(quest) {
  const state = quest.goblin.getState();
  const wks = state.get('workitems');
  return wks ? wks.toJS() : {};
});

Goblin.registerQuest(goblinName, 'delete', function(quest) {
  quest.log.info('Deleting desktop...');
});

// Create a Goblin with initial state and handlers
module.exports = Goblin.configure(goblinName, logicState, logicHandlers);
