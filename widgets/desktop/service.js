'use strict';
//T:2019-02-27
const watt = require('gigawatts');
const path = require('path');
const Goblin = require('xcraft-core-goblin');
const uuidV4 = require('uuid/v4');
const goblinName = path.basename(module.parent.filename, '.js');
const {getToolbarId} = require('goblin-nabu/lib/helpers.js');
const StringBuilder = require('goblin-nabu/lib/string-builder.js');
const xUtils = require('xcraft-core-utils');
const {getFileFilter} = xUtils.files;
const nabuConfig = require('xcraft-core-etc')().load('goblin-nabu');
const T = require('goblin-nabu/widgets/helpers/t.js');
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
const logicHandlers = require('./logic-handlers.js');

// Register quest's according rc.json
Goblin.registerQuest(
  goblinName,
  'create',
  function*(quest, labId, username, session, configuration, routes) {
    quest.goblin.setX('labId', labId);
    quest.goblin.setX('configuration', configuration);
    // CREATE DEFAULT CONTEXT MANAGER
    yield quest.create('contexts', {
      id: `contexts@${quest.goblin.id}`,
      desktopId: quest.goblin.id,
    });

    // CREATE NABU TOOLBAR IF NEEDED
    if (nabuConfig.storageAvailable) {
      const toolbarId = `nabu-toolbar@${quest.goblin.id}`;
      yield quest.create('nabu-toolbar', {
        id: toolbarId,
        desktopId: quest.goblin.id,
        enabled: false,
        show: true,
      });
    }
    // CREATE DEFAULT TABS MANAGER
    yield quest.create('tabs', {
      id: `tabs@${quest.goblin.id}`,
      desktopId: quest.goblin.id,
    });

    if (!routes) {
      routes = defaultRoutes;
    }

    quest.do({id: quest.goblin.id, routes, username, session});

    quest.log.info(`Desktop ${quest.goblin.id} created!`);
    const id = quest.goblin.id;
    quest.goblin.defer(
      quest.sub(
        `*::*.${
          quest.goblin.id.split('@')[1]
        }.desktop-notification-broadcasted`,
        function*(err, {msg, resp}) {
          yield resp.cmd(`${goblinName}.add-notification`, {id, ...msg.data});
        }
      )
    );

    quest.goblin.defer(
      quest.sub(`*::*.${quest.goblin.id}.add-workitem-requested`, function*(
        err,
        {msg, resp}
      ) {
        yield resp.cmd(`${goblinName}.add-workitem`, {id, ...msg.data});
      })
    );

    return quest.goblin.id;
  },
  ['*::*.desktop-notification-broadcasted']
);

Goblin.registerQuest(goblinName, 'change-locale', function(quest, locale) {
  quest.evt('user-locale-changed', {locale});
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
  if (tabId) {
    yield desk.removeTab({
      workitemId: widgetId,
      contextId: workitem.contextId,
      tabId,
      navToLastWorkitem: true,
      close,
    });
  }

  quest.do({widgetId});

  if (close) {
    yield quest.cmd(`${workitem.name}.close`, {
      id: widgetId,
    });
  }
  yield quest.kill([widgetId]);
  quest.evt(`${widgetId}.workitem.closed`);
});

Goblin.registerQuest(
  goblinName,
  'add-workitem',
  function*(quest, workitem, navigate) {
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

    /* FIXME: handle wizard lifetime properly */
    if (workitem.name.endsWith('-wizard')) {
      const unsub = quest.sub(`*::${widgetId}.done`, function*(_, {resp}) {
        unsub();
        yield quest.kill(widgetId);
        if (workitem.kind === 'tab') {
          yield resp.cmd(`desktop.remove-tab`, {
            id: desktopId,
            contextId: workitem.contextId,
            workitemId: widgetId,
            tabId: widgetId,
            navToLastWorkitem: true,
            close: false,
          });
        }
      });
    }

    if (workitemAPI.waitLoaded) {
      yield workitemAPI.waitLoaded();
    }

    switch (workitem.kind) {
      default:
        break;
      case 'tab': {
        yield desk.addTab({
          workitemId: widgetId,
          entityId: workitem.payload.entityId,
          view: workitem.view,
          contextId: workitem.contextId,
          name: workitem.description,
          glyph: workitem.icon,
          closable: true,
          navigate: !!navigate,
        });
        quest.do({widgetId, tabId: widgetId});
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
  },
  ['*::*.done']
);

Goblin.registerQuest(goblinName, 'add-context', function*(
  quest,
  contextId,
  name
) {
  const contexts = quest.getAPI(`contexts@${quest.goblin.id}`);
  yield contexts.add({
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

Goblin.registerQuest(goblinName, 'remove-dialog', function*(quest, dialogId) {
  yield quest.me.closeDialog({dialogId});
  yield quest.kill([dialogId]);
});

Goblin.registerQuest(goblinName, 'close-dialog', function*(quest, dialogId) {
  const state = quest.goblin.getState();
  quest.evt(`nav.requested`, {
    route: buildDialogNavRequest(state),
  });
  yield quest.me.cleanWorkitem({workitemId: dialogId});
});

Goblin.registerQuest(goblinName, 'change-theme', function(quest, name) {
  quest.evt(`change-theme.requested`, {
    name,
  });
});

Goblin.registerQuest(goblinName, 'change-team', function(quest, teamId) {
  quest.do();
});

Goblin.registerQuest(goblinName, 'get-current-context', function(quest) {
  return quest.goblin.getState().get('current.workcontext');
});

Goblin.registerQuest(goblinName, 'nav-to-context', function*(quest, contextId) {
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

  const contexts = quest.getAPI(`contexts@${quest.goblin.id}`);
  yield contexts.setCurrent({
    contextId,
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
  if (!last) {
    return;
  }

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
  externalUrl,
  isDownload,
  broadcast
) {
  if (!notificationId) {
    notificationId = uuidV4();
  }

  message = StringBuilder.combine(message);

  if (broadcast) {
    quest.evt(
      `${quest.goblin.id.split('@')[1]}.desktop-notification-broadcasted`,
      {
        notificationId,
        glyph,
        color,
        message,
        command,
        externalUrl,
        isDownload,
      }
    );
    return;
  }

  quest.do({
    notificationId,
    glyph,
    color,
    message,
    command,
    externalUrl,
    isDownload,
  });
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

Goblin.registerQuest(goblinName, 'click-notification', function*(
  quest,
  notification
) {
  if (notification.command) {
    yield quest.cmd(notification.command, {notification});
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

Goblin.registerQuest(goblinName, 'download-file', function(
  quest,
  filePath,
  openFile
) {
  const labId = quest.goblin.getX('labId');
  const fs = require('fs');
  const stream = fs.createReadStream;
  const {appId} = require('xcraft-core-host');
  if (fs.existsSync(filePath)) {
    let file = stream(filePath);
    quest.evt(`${labId}.download-file-requested`, {
      xcraftStream: file,
      appId,
      fileFilter: getFileFilter(filePath),
      defaultPath: path.basename(filePath),
      openFile,
    });
  }
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

Goblin.registerQuest(goblinName, 'close', function*(quest, closeIn) {
  let count = closeIn ? closeIn : 0;
  quest.log.info(`Closing desktop in ${count}sec...`);
  const message = T(
    'Un administrateur à demandé la fermeture de votre session dans {count}sec',
    '',
    {count}
  );
  yield quest.me.addNotification({
    notificationId: quest.goblin.id,
    color: 'red',
    glyph: 'solid/exclamation-triangle',
    message,
  });
  const countdown = setInterval(
    watt(function*() {
      count--;
      const message = T(
        'Un administrateur à demandé la fermeture de votre session dans {count}sec',
        '',
        {
          count,
        }
      );
      yield quest.me.addNotification({
        notificationId: quest.goblin.id,
        color: 'red',
        glyph: 'solid/exclamation-triangle',
        message,
      });
    }),
    1000
  );
  setTimeout(() => {
    clearInterval(countdown);
    quest.evt(`session.closed`);
  }, 1000 * count);
});

Goblin.registerQuest(goblinName, 'delete', function(quest) {
  quest.log.info('Deleting desktop...');
});

// Create a Goblin with initial state and handlers
module.exports = Goblin.configure(goblinName, logicState, logicHandlers);
