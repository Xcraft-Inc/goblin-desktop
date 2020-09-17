'use strict';
//T:2019-02-27
const watt = require('gigawatts');
const path = require('path');
const Goblin = require('xcraft-core-goblin');
const uuidV4 = require('uuid/v4');
const goblinName = path.basename(module.parent.filename, '.js');
const StringBuilder = require('goblin-nabu/lib/string-builder.js');
const xUtils = require('xcraft-core-utils');
const locks = require('xcraft-core-utils/lib/locks');
const {getFileFilter} = xUtils.files;
const T = require('goblin-nabu/widgets/helpers/t.js');
const {JobQueue} = require('xcraft-core-utils');

const mutex = locks.getMutex;
const questLock = (quest) => `${quest.questName}/${quest.goblin.id}`;

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
const extractContextIdFromCurrentLocation = (loc) => {
  return `${loc.get('pathname').split('/')[1]}`;
};
/******************************************************************************/

// Register quest's according rc.json
Goblin.registerQuest(
  goblinName,
  'create',
  function* (
    quest,
    clientSessionId,
    labId,
    username,
    session,
    configuration,
    useNabu,
    routes
  ) {
    if (clientSessionId) {
      quest.goblin.setX('clientSessionId', clientSessionId);
    } else {
      quest.log.warn('no clientSessionId provided to the new desktop');
    }
    quest.goblin.setX('labId', labId);
    quest.goblin.setX('configuration', configuration);
    // CREATE DEFAULT CONTEXT MANAGER
    yield quest.create('contexts', {
      id: `contexts@${quest.goblin.id}`,
      desktopId: quest.goblin.id,
    });

    // CREATE NABU TOOLBAR IF NEEDED
    if (useNabu) {
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

    const addQueue = new JobQueue(
      `Add workitem queue for: ${id}`,
      function* ({work, resp}) {
        yield resp.cmd(`${goblinName}.do-add`, {id, ...work});
      },
      1
    );
    quest.goblin.defer(
      quest.sub(`*::${id}.add-workitem-enqueued`, function (err, {msg, resp}) {
        addQueue.push({id: msg.id, work: {...msg.data}, resp});
      })
    );

    quest.goblin.defer(
      quest.sub(
        `*::*.${
          quest.goblin.id.split('@')[1]
        }.desktop-notification-broadcasted`,
        function* (err, {msg, resp}) {
          yield resp.cmd(`${goblinName}.add-notification`, {id, ...msg.data});
        }
      )
    );

    quest.goblin.defer(
      quest.sub(`*::*.${quest.goblin.id}.add-workitem-requested`, function* (
        err,
        {msg, resp}
      ) {
        yield resp.cmd(`${goblinName}.add-workitem`, {id, ...msg.data});
      })
    );

    quest.goblin.defer(
      quest.sub(`*::*.${quest.goblin.id}.remove-workitem-requested`, function* (
        err,
        {msg, resp}
      ) {
        yield resp.cmd(`${goblinName}.remove-workitem`, {id, ...msg.data});
      })
    );

    return quest.goblin.id;
  },
  ['*::*.desktop-notification-broadcasted']
);

/******************************************************************************/

Goblin.registerQuest(goblinName, 'change-locale', function (quest, locale) {
  const clientSessionId = quest.goblin.getX('clientSessionId');
  quest.evt(`${clientSessionId}.user-locale-changed`, {locale});
});

/******************************************************************************/

Goblin.registerQuest(goblinName, 'remove-workitem', function* (
  quest,
  workitem,
  close,
  navToLastWorkitem
) {
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
  quest.log.dbg(`Removing ${widgetId}...`);
  yield mutex.lock(widgetId);
  const state = quest.goblin.getState();

  const exist = state.get(`workitems.${widgetId}`);
  if (!exist) {
    quest.log.dbg(`Skipping ${widgetId} remove...`);
    mutex.unlock(widgetId);
    return;
  }

  if (!workitem.contextId) {
    workitem.contextId = state.get(`current.workcontext`);
  }

  // Remove the tab
  const tabId = state.get(`workitems.${widgetId}.tabId`);
  if (tabId) {
    const tabsAPI = quest.getAPI(`tabs@${quest.goblin.id}`);
    yield tabsAPI.clean({
      contextId: workitem.contextId,
      tabId,
    });
  }

  quest.do({widgetId});

  const api = quest.getAPI(widgetId);
  if (api && close) {
    if (api.close) {
      yield api.close({kind: 'kill'});
    }
  }

  yield quest.kill([widgetId]);

  if (navToLastWorkitem) {
    yield quest.me.navToLastWorkitem();
  }
  mutex.unlock(widgetId);
  quest.log.dbg(`Removing ${widgetId}...[DONE]`);
});

/******************************************************************************/
Goblin.registerQuest(goblinName, 'do-add', function* (
  quest,
  widgetId,
  clientSessionId,
  workitem,
  currentLocation,
  navigate
) {
  const desk = quest.me;
  const desktopId = desk.id;

  /* Manage `maxInstances` property which is useful to limit the quantity
   * of instances. If the `navigate` property is passed to true, then
   * a navigate is performed with the first entry.
   */
  if (Number.isInteger(workitem.maxInstances)) {
    const workitems = quest.goblin.getState().get('workitems');
    if (workitems) {
      const items = workitems.filter((v, k) =>
        k.startsWith(`${workitem.name}@`)
      );

      if (items.count() >= workitem.maxInstances) {
        const workitemId = items.keySeq().first();
        if (navigate) {
          const currentSearch = currentLocation.get('search');
          if (currentSearch) {
            if (!currentSearch.includes(workitemId)) {
              yield desk.navToWorkitem({
                contextId: workitem.contextId,
                view: workitem.view,
                workitemId,
                currentLocation,
              });
            }
          }
        }

        quest.log.dbg(`Skipping ${widgetId} add`);
        quest.evt(`${widgetId}.skipped`, {
          desktopId,
          workitemId: widgetId,
          skipped: true,
        });
        return;
      }
    }
  }

  const workitemAPI = yield quest.create(
    widgetId,
    Object.assign(
      {
        id: widgetId,
        desktopId,
        clientSessionId,
        contextId: workitem.contextId,
        workflowId: workitem.workflowId,
        isDialog: workitem.kind === 'dialog',
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
      yield desk.addTab({
        workitemId: widgetId,
        entityId: workitem.payload.entityId,
        view: workitem.view,
        contextId: workitem.contextId,
        name: workitem.description,
        glyph: workitem.icon,
        closable: true,
        navigate: !!navigate,
        currentLocation,
      });
      quest.dispatch('set-workitem', {
        widgetId,
        tabId: widgetId,
        view: workitem.view,
      });
      break;
    }
    case 'dialog': {
      yield desk.addDialog({
        dialogId: widgetId,
        currentLocation,
      });
      quest.dispatch('set-workitem', {
        widgetId,
        tabId: null,
        view: workitem.view,
      });
      break;
    }
  }

  quest.evt(`${widgetId}.added`, {
    desktopId,
    workitemId: widgetId,
    skipped: false,
  });
});

Goblin.registerQuest(goblinName, 'add-workitem', function* (
  quest,
  workitem,
  currentLocation,
  clientSessionId,
  navigate
) {
  if (!workitem.name) {
    throw new Error(
      `Cannot add workitem without a name: ${JSON.stringify(workitem)}`
    );
  }

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

  if (!workitem.view) {
    workitem.view = 'default';
  }

  if (!workitem.kind) {
    workitem.kind = 'tab';
  }

  if (workitem.kind === 'dialog') {
    workitem.maxInstances = 1;
  }

  if (!workitem.contextId) {
    if (currentLocation) {
      workitem.contextId = extractContextIdFromCurrentLocation(currentLocation);
    } else {
      const state = quest.goblin.getState();
      workitem.contextId = state.get(`current.workcontext`, null);
    }
  }

  //Manage collision with desktopId
  if (workitem.payload) {
    if (workitem.payload.desktopId) {
      workitem.payload.deskId = workitem.payload.desktopId;
      delete workitem.payload.desktopId;
    }
  }

  const desktopId = quest.goblin.id;
  const widgetId = `${workitem.name}${
    workitem.mode ? `@${workitem.mode}` : ''
  }@${desktopId}@${workitem.id}`;

  quest.log.dbg(`Adding ${widgetId}...`);
  yield quest.doSync({working: true});
  const autoRelease = () => {
    quest.evt(`${widgetId}.skipped`, {
      desktopId,
      workitemId: widgetId,
      skipped: true,
    });
  };
  const timeoutCancel = setTimeout(autoRelease, 1000);
  const res = yield quest.sub.callAndWait(function () {
    quest.evt('add-workitem-enqueued', {
      desktopId,
      toDesktopId: desktopId,
      currentLocation,
      widgetId,
      workitem,
      clientSessionId,
      navigate,
    });
  }, `*::${desktopId}.${widgetId}.(added|skipped)`);
  clearTimeout(timeoutCancel);
  yield quest.doSync({working: false});

  if (res.skipped) {
    quest.log.dbg(`Adding ${widgetId}...[FAILED]`);
    return null;
  } else {
    quest.log.dbg(`Adding ${widgetId}...[DONE]`);
    return widgetId;
  }
});

/******************************************************************************/

Goblin.registerQuest(goblinName, 'add-context', function* (
  quest,
  contextId,
  name
) {
  const contexts = quest.getAPI(`contexts@${quest.goblin.id}`);
  yield contexts.add({
    contextId,
    name,
  });
});

/******************************************************************************/

Goblin.registerQuest(goblinName, 'add-tab', function* (
  quest,
  name,
  contextId,
  view,
  workitemId,
  entityId,
  closable,
  glyph,
  navigate,
  currentLocation
) {
  const state = quest.goblin.getState();
  const currentContext = state.get(`current.workcontext`, null);
  if (!contextId) {
    if (currentLocation) {
      contextId = extractContextIdFromCurrentLocation(currentLocation);
    } else {
      contextId = currentContext;
    }
  }
  if (!view) {
    view = 'default';
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

  if (navigate && currentContext === contextId) {
    yield quest.cmd('desktop.nav-to-workitem', {
      id: quest.goblin.id,
      contextId,
      view,
      workitemId,
      currentLocation,
    });
  }
  return tabId;
});

/******************************************************************************/

Goblin.registerQuest(goblinName, 'remove-tab', function* (
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

/******************************************************************************/

const buildDialogNavRequest = (state, newArg, currentLocation) => {
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

  if (currentLocation) {
    const search = currentLocation.get('search');
    const hash = currentLocation.get('hash');
    const path = currentLocation.get('pathname');
    return `${path}${search}${newArg}${hash}`;
  } else {
    return `/${contextId}/${view}?wid=${currentWorkitemId}${newArg}`;
  }
};

/******************************************************************************/

Goblin.registerQuest(goblinName, 'add-dialog', function* (
  quest,
  contextId,
  dialogId,
  view,
  currentLocation
) {
  //save current loc if provided
  if (currentLocation) {
    quest.dispatch('setCurrentLocationByWorkitem', {
      path: currentLocation.get('pathname'),
      hash: currentLocation.get('hash'),
      search: currentLocation.get('search'),
    });
  }

  quest.do();

  const state = quest.goblin.getState();

  yield quest.me.navAndWait({
    route: buildDialogNavRequest(state, `did=${dialogId}`, currentLocation),
  });
});

Goblin.registerQuest(goblinName, 'nav-and-wait', function* (quest, route) {
  const navRequestId = quest.uuidV4();
  yield quest.sub.callAndWait(function () {
    quest.evt(`nav.requested`, {
      route,
      navRequestId,
    });
  }, `*::*.${navRequestId}.done`);
});

/******************************************************************************/

Goblin.registerQuest(goblinName, 'change-theme', function (quest, name) {
  quest.evt(`change-theme.requested`, {
    name,
  });
});

/******************************************************************************/

Goblin.registerQuest(goblinName, 'change-team', function (quest, teamId) {
  quest.do();
});

/******************************************************************************/

Goblin.registerQuest(goblinName, 'get-current-context', function (quest) {
  return quest.goblin.getState().get('current.workcontext');
});

/******************************************************************************/

Goblin.registerQuest(goblinName, 'set-nav-to-default', function* (
  quest,
  defaultContextId
) {
  const state = quest.goblin.getState();
  const currentWK = state.get('current.workcontext');
  if (currentWK) {
    const location = state.get(`current.location.${currentWK}`, null);
    let route;
    if (location) {
      route = `${location.get('path')}${location.get('search')}${location.get(
        'hash'
      )}`;
    } else {
      route = `/${currentWK}`;
    }
    yield quest.me.navAndWait({route});
  } else {
    yield quest.me.navToContext({contextId: defaultContextId});
  }
});

Goblin.registerQuest(goblinName, 'nav-to-context', function* (
  quest,
  contextId,
  currentLocation
) {
  yield mutex.lock(questLock(quest));
  const state = quest.goblin.getState();
  const location = state.get(`current.location.${contextId}`, null);
  let route;

  if (currentLocation) {
    quest.dispatch('setCurrentLocationByContext', {
      path: currentLocation.get('pathname'),
      hash: currentLocation.get('hash'),
      search: currentLocation.get('search'),
    });
  }

  if (location) {
    route = `${location.get('path')}${location.get('search')}${location.get(
      'hash'
    )}`;
  } else {
    route = `/${contextId}`;
  }

  yield quest.doSync();

  yield quest.me.navAndWait({route});
  mutex.unlock(questLock(quest));
});

/******************************************************************************/

Goblin.registerQuest(goblinName, 'nav-to-workitem', function* (
  quest,
  contextId,
  view,
  workitemId,
  skipNav,
  currentLocation
) {
  yield mutex.lock(questLock(quest));
  const state = quest.goblin.getState();

  if (!contextId) {
    contextId = state.get(`current.workcontext`, null);
  }

  //save current loc if provided
  if (currentLocation) {
    quest.dispatch('setCurrentLocationByWorkitem', {
      path: currentLocation.get('pathname'),
      hash: currentLocation.get('hash'),
      search: currentLocation.get('search'),
    });
  }

  //set new current workitem
  quest.dispatch('setCurrentWorkitemByContext', {contextId, view, workitemId});

  if (!skipNav) {
    let route = `/${contextId}/${view}?wid=${workitemId}`;

    const location = state.get(`current.location.${workitemId}`, null);
    if (location) {
      const search = location.get('search');
      const path = location.get('path');
      const hash = location.get('hash');
      if (search) {
        route = `${path}${search}${hash}`;
      }
    }
    yield quest.me.navAndWait({route});
  }

  mutex.unlock(questLock(quest));
});

/******************************************************************************/

Goblin.registerQuest(goblinName, 'nav-to-last-workitem', function* (quest) {
  yield mutex.lock(questLock(quest));
  const state = quest.goblin.getState();
  const currentWorkcontext = state.get('current.workcontext');
  const last = state.get(`last.${currentWorkcontext}`);
  if (!last) {
    mutex.unlock(questLock(quest));
    return;
  }

  const contextId = last.get('workcontext');
  const view = last.get('view');
  const workitemId = last.get('workitem');

  quest.dispatch('setCurrentWorkitemByContext', {
    contextId,
    view,
    workitemId,
  });

  let route = `/${contextId}`;

  if (view && workitemId) {
    route += `/${view}?wid=${workitemId}`;
  }

  if (workitemId) {
    const location = state.get(`current.location.${workitemId}`, null);
    if (location) {
      const search = location.get('search');
      const path = location.get('path');
      const hash = location.get('hash');
      route = `${path}${search}${hash}`;
    }
  }

  yield quest.me.navAndWait({route});

  mutex.unlock(questLock(quest));
});

/******************************************************************************/

Goblin.registerQuest(goblinName, 'clear-workitem', function* (
  quest,
  contextId
) {
  quest.dispatch('setCurrentWorkitemByContext', {
    contextId,
    view: null,
    workitemId: null,
  });
  yield quest.me.navAndWait({route: `/${contextId}/?wid=null`});
});

Goblin.registerQuest(goblinName, 'run-client-quest', function (
  quest,
  clientSessionId,
  goblinName,
  goblinId,
  questName,
  questArgs
) {
  quest.evt(`${clientSessionId}.run-client-quest-requested`, {
    desktopId: quest.goblin.id,
    goblinName,
    goblinId,
    questName,
    questArgs,
  });
});

Goblin.registerQuest(goblinName, 'open-window', function* (
  quest,
  contextId,
  workitemId
) {
  //TODO: tab close
  const state = quest.goblin.getState();
  const clientSessionId = quest.goblin.getX('clientSessionId');
  const rootWidgetId = `desktop-window@${workitemId}`;
  const view = state.get(`workitems.${workitemId}.view`);
  yield quest.create('desktop-window', {
    id: rootWidgetId,
    desktopId: quest.goblin.id,
    view,
    contextId: contextId,
    workitemId,
  });
  /*const parts = workitemId.split('@');
  yield quest.me.removeWorkitem({
    workitem: {name: parts.shift(), id: parts.join('@'), contextId},
    navToLastWorkitem: true,
  });*/
  quest.evt(`${clientSessionId}.open-window-requested`, {
    desktopId: quest.goblin.id,
    rootWidget: 'desktop-window',
    rootWidgetId,
  });
});

Goblin.registerQuest(goblinName, 'update-current-location', function* (
  quest,
  currentLocation
) {
  const search = currentLocation.get('search');
  const hash = currentLocation.get('hash');
  const path = currentLocation.get('pathname');
  const route = `${path}${search}${hash}`;
  quest.dispatch('setCurrentLocationByWorkitem', {
    path,
    hash,
    search,
  });
  yield quest.me.navAndWait({route});
});

/******************************************************************************/

Goblin.registerQuest(goblinName, 'dispatch', function (quest, action) {
  quest.evt(`dispatch.requested`, {
    action,
  });
});

Goblin.registerQuest(goblinName, 'start-nav', function* (quest) {
  const navigating = quest.goblin.getState().get('navigating');
  if (navigating) {
    return false;
  }
  yield quest.doSync();
  return true;
});

Goblin.registerQuest(goblinName, 'end-nav', function* (
  quest,
  navRequestId,
  route,
  skip
) {
  if (!skip) {
    yield quest.doSync();
  }
  if (navRequestId) {
    quest.evt(`${navRequestId}.done`);
  }
});

/******************************************************************************/

Goblin.registerQuest(goblinName, 'gamepad-changed', function (quest, gamepad) {
  console.dir(gamepad.toJS());
});

/******************************************************************************/

//---------------//
// Notifications //
//---------------//

Goblin.registerQuest(goblinName, 'add-notification', function (
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
  if (!dnd) {
    quest.dispatch('set-notifications', {show: true});
  }
  quest.dispatch('update-not-read-count');

  return quest.goblin
    .getState()
    .get(`notifications.${notificationId}`, null)
    .toJS();
});

Goblin.registerQuest(goblinName, 'remove-notification', function (
  quest,
  notification
) {
  quest.do({notification});
  quest.dispatch('update-not-read-count');
});

Goblin.registerQuest(goblinName, 'remove-notifications', function (quest) {
  quest.do();
  quest.dispatch('update-not-read-count');
});

Goblin.registerQuest(goblinName, 'click-notification', function* (
  quest,
  notification
) {
  if (notification.command) {
    yield quest.cmd(notification.command, {notification});
  }
});

Goblin.registerQuest(goblinName, 'set-dnd', function (quest, show) {
  quest.do();
});

Goblin.registerQuest(goblinName, 'set-only-news', function (quest, show) {
  quest.do();
});

Goblin.registerQuest(goblinName, 'set-notifications', function (quest, show) {
  quest.do();
  if (!show) {
    quest.dispatch('read-all');
  }
  quest.dispatch('update-not-read-count');
});

/******************************************************************************/

//--------------//
// StateMonitor //
//--------------//

Goblin.registerQuest(goblinName, 'show-state-monitor', function (quest) {
  quest.do();
});

Goblin.registerQuest(goblinName, 'add-state-monitor', function (quest) {
  quest.do();
});

Goblin.registerQuest(goblinName, 'back-state-monitor', function (quest) {
  quest.do();
});

Goblin.registerQuest(goblinName, 'forward-state-monitor', function (quest) {
  quest.do();
});

/******************************************************************************/

Goblin.registerQuest(goblinName, 'download-file', function (
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
    quest.evt(`wm@${labId}.download-file-requested`, {
      xcraftStream: file,
      appId,
      fileFilter: getFileFilter(filePath),
      defaultPath: path.basename(filePath),
      openFile,
    });
  }
});

/******************************************************************************/

Goblin.registerQuest(goblinName, 'change-mandate', function (quest) {
  quest.evt(`mandate.changed`);
});

/******************************************************************************/

Goblin.registerQuest(goblinName, 'change-screen', function (quest) {
  quest.evt(`screen.changed`);
});

/******************************************************************************/

Goblin.registerQuest(goblinName, 'get-configuration', function (quest) {
  const conf = quest.goblin.getX('configuration');
  return conf;
});

/******************************************************************************/

Goblin.registerQuest(goblinName, 'get-user-info', function (quest) {
  return quest.goblin.getState().get('username');
});

/******************************************************************************/

Goblin.registerQuest(goblinName, 'get-lab-id', function (quest) {
  return quest.goblin.getX('labId');
});

/******************************************************************************/

Goblin.registerQuest(goblinName, 'get-client-session-id', function (quest) {
  return quest.goblin.getX('clientSessionId');
});

/******************************************************************************/

Goblin.registerQuest(goblinName, 'get-workitems', function (quest) {
  const state = quest.goblin.getState();
  const wks = state.get('workitems');
  return wks ? wks.toJS() : {};
});

/******************************************************************************/

Goblin.registerQuest(goblinName, 'close', function* (quest, closeIn) {
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
    watt(function* () {
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
    quest.release(quest.goblin.id);
  }, 1000 * count);
});

/******************************************************************************/

Goblin.registerQuest(goblinName, 'open-entity-wizard', function* (
  quest,
  currentLocation
) {
  yield quest.me.addWorkitem({
    workitem: {name: 'open-entity-wizard', kind: 'dialog'},
    currentLocation,
  });
});

/******************************************************************************/

Goblin.registerQuest(goblinName, 'delete', function (quest) {
  quest.log.info('Deleting desktop...');
});

/******************************************************************************/

Goblin.registerQuest(goblinName, 'toggle-monitor-feed', function* (
  quest,
  isOn
) {
  if (!isOn) {
    yield quest.warehouse.feedSubscriptionAdd({
      feeds: [quest.goblin.id],
      branch: 'activity-monitor',
    });
  } else {
    yield quest.warehouse.feedSubscriptionDel({
      feed: quest.goblin.id,
      branch: 'activity-monitor',
    });
  }
  console.log('feed!');
});

// Create a Goblin with initial state and handlers
module.exports = Goblin.configure(goblinName, logicState, logicHandlers);
