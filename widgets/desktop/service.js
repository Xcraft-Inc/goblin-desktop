'use strict';

const path = require('path');
const Goblin = require('xcraft-core-goblin');
const uuidV4 = require('uuid/v4');
const watt = require('gigawatts');
const goblinName = path.basename(module.parent.filename, '.js');
const StringBuilder = require('goblin-nabu/lib/string-builder.js');
const xUtils = require('xcraft-core-utils');
const {getFileFilter} = xUtils.files;
const {locks} = require('xcraft-core-utils');
const doAddLock = locks.getMutex;
// Define initial logic values
const logicState = {};

// Define logic handlers according rc.json
const logicHandlers = require('./logic-handlers.js');
/******************************************************************************/

// Register quest's according rc.json
Goblin.registerQuest(goblinName, 'create', function* (
  quest,
  clientSessionId,
  labId,
  username,
  session,
  configuration,
  routes,
  mainGoblin
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

  //CREATE TASKBAR (TASK LAUNCHER)
  quest.create('taskbar', {
    id: `taskbar@${quest.goblin.id}`,
    desktopId: quest.goblin.id,
  });

  if (!mainGoblin && configuration) {
    mainGoblin = configuration.mainGoblin;
  }

  if (mainGoblin) {
    let useNabu = mainGoblin === 'nabu';

    if (!useNabu) {
      const mainConfig = require('xcraft-core-etc')().load(
        `goblin-${mainGoblin}`
      );
      useNabu = mainConfig.profile && mainConfig.profile.useNabu;
    }

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
  }

  quest.do({
    id: quest.goblin.id,
    username,
    session,
    profileKey: configuration && configuration.id,
  });

  quest.log.info(`Desktop ${quest.goblin.id} created!`);
  const id = quest.goblin.id;

  quest.goblin.defer(
    quest.sub(
      `*::*.${quest.goblin.id.split('@')[1]}.desktop-notification-broadcasted`,
      function* (err, {msg, resp}) {
        yield resp.cmd(`${goblinName}.add-notification`, {id, ...msg.data});
      }
    )
  );

  quest.goblin.defer(
    quest.sub(`*::*.${quest.goblin.id}.<add-workitem-requested>`, function* (
      err,
      {msg, resp}
    ) {
      yield resp.cmd(`${goblinName}.add-workitem`, {id, ...msg.data});
    })
  );

  quest.goblin.defer(
    quest.sub(`*::*.${quest.goblin.id}.<remove-workitem-requested>`, function* (
      err,
      {msg, resp}
    ) {
      yield resp.cmd(`${goblinName}.removeWorkitem`, {id, ...msg.data});
    })
  );

  return quest.goblin.id;
});

/******************************************************************************/

Goblin.registerQuest(goblinName, 'change-locale', function (quest, locale) {
  const labId = quest.goblin.getX('labId');
  quest.evt(`<${labId}>.user-locale-changed`, {locale});
});

/******************************************************************************/

Goblin.registerQuest(goblinName, 'removeWorkitem', function* (
  quest,
  workitemId,
  close,
  navToLastWorkitem
) {
  const state = quest.goblin.getState();
  const workitem = state.get(`workitems.${workitemId}`);
  if (!workitem) {
    quest.log.dbg(`Skipping ${workitemId} remove...`);
    return;
  }
  quest.do({workitemId});

  const api = quest.getAPI(workitemId);
  if (api && close) {
    if (api.close) {
      yield api.close({kind: 'kill'});
    }
  }

  yield quest.kill([workitemId]);

  const kind = workitem.get('kind');
  if (navToLastWorkitem && kind !== 'dialog') {
    yield quest.me.navToLastWorkitem();
  }

  if (kind === 'dialog') {
    const contextId = workitem.get('context');
    quest.dispatch('setCurrentDialogByContext', {
      contextId,
      workitemId: null,
    });
  }
  quest.log.dbg(`Removing ${workitemId}...[DONE]`);
});

/******************************************************************************/
const doAdd = watt(function* (
  quest,
  widgetId,
  clientSessionId,
  workitem,
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
        const workitemKind = workitems.get(workitemId).get('kind');
        //navigate to existing tab when possible
        if (navigate && workitemKind !== 'dialog') {
          yield desk.navToWorkitem({
            workitemId,
          });
        }

        quest.log.dbg(`Skipping ${widgetId} add`);
        return {
          desktopId,
          workitemId: widgetId,
          skipped: true,
        };
      }
    }
  }

  quest.dispatch('set-workitem', {
    id: widgetId,
    kind: workitem.kind,
    entityId: workitem.payload.entityId,
    context: workitem.contextId,
    view: workitem.view,
    name: workitem.description,
    glyph: workitem.icon,
    closable: true,
  });

  if (workitem.kind === 'dialog') {
    quest.dispatch('setCurrentDialogByContext', {
      contextId: workitem.contextId,
      workitemId: widgetId,
    });
  }

  if (navigate && workitem.kind !== 'dialog') {
    yield desk.navToWorkitem({
      workitemId: widgetId,
    });
  }

  return {
    desktopId,
    workitemId: widgetId,
    skipped: false,
  };
});

Goblin.registerQuest(goblinName, 'add-workitem', function* (
  quest,
  workitem,
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

  const desktopId = quest.goblin.id;
  const widgetId = `${workitem.name}${
    workitem.mode ? `@${workitem.mode}` : ''
  }@${desktopId}@${workitem.id}`;

  quest.log.dbg(`Adding ${widgetId}...`);

  yield doAddLock.lock(desktopId);
  const res = yield doAdd(quest, widgetId, clientSessionId, workitem, navigate);
  doAddLock.unlock(desktopId);

  if (res.skipped) {
    quest.log.dbg(`Adding ${widgetId}...[FAILED]`);
    return null;
  } else {
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

Goblin.registerQuest(goblinName, 'setHinter', function (quest, hinterId) {
  quest.do({hinterId});
});

Goblin.registerQuest(goblinName, 'setDetail', function (quest, hinterId) {
  if (!hinterId) {
    quest.do({detailId: null});
    return;
  }
  const parts = hinterId.split('@');
  const name = parts[0].replace(/-hinter/, '-detail');
  const endParts = parts.slice(1);
  const detailId = `${name}@${endParts.join('@')}`;
  quest.do({detailId});
});

/******************************************************************************/

Goblin.registerQuest(goblinName, 'change-theme', function (quest, name) {
  quest.evt.full(`<${quest.goblin.id}>.change-theme.requested`, {
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
  if (!currentWK) {
    yield quest.me.navToContext({contextId: defaultContextId});
  }
});

Goblin.registerQuest(goblinName, 'navToContext', function (quest, contextId) {
  quest.do({contextId});
});

/******************************************************************************/

Goblin.registerQuest(goblinName, 'navToWorkitem', function (quest, workitemId) {
  const state = quest.goblin.getState();

  const workitem = state.get(`workitems.${workitemId}`);
  const contextId = workitem.get('context');
  const view = workitem.get('view');

  //set new current workitem
  quest.dispatch('setCurrentWorkitemByContext', {contextId, view, workitemId});
});

/******************************************************************************/

Goblin.registerQuest(goblinName, 'navToLastWorkitem', function (quest) {
  const state = quest.goblin.getState();
  const currentWorkcontext = state.get('current.workcontext');
  const last = state.get(`last.${currentWorkcontext}`);
  if (!last) {
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
});

/******************************************************************************/

Goblin.registerQuest(goblinName, 'run-client-quest', function (
  quest,
  labId,
  goblinName,
  goblinId,
  questName,
  questArgs
) {
  quest.evt(`<${labId}>.run-client-quest-requested`, {
    desktopId: quest.goblin.id,
    goblinName,
    goblinId,
    questName,
    questArgs,
  });
});

/******************************************************************************/

Goblin.registerQuest(goblinName, 'dispatch', function (quest, action) {
  quest.evt.full(`<${quest.goblin.id}>.dispatch.requested`, {
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

Goblin.registerQuest(goblinName, 'set-lab-id', function (quest, labId) {
  return quest.goblin.setX('labId', labId);
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

Goblin.registerQuest(goblinName, 'close', function* (quest) {
  const deskManager = quest.getAPI('desktop-manager');
  yield deskManager.close({sessionDesktopId: quest.goblin.id});
});

Goblin.registerQuest(goblinName, 'on-close-window', function (
  quest,
  currentUrl
) {
  //const state = quest.goblin.getState().toJS();
  //console.dir(state.current.location);
  quest.log.dbg(`${quest.goblin.id} window closing...`);
});

/******************************************************************************/

Goblin.registerQuest(goblinName, 'open-entity-wizard', function* (quest) {
  yield quest.me.addWorkitem({
    workitem: {name: 'open-entity-wizard', kind: 'dialog'},
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
      feed: quest.goblin.id,
      branch: 'activity-monitor',
    });
  } else {
    yield quest.warehouse.feedSubscriptionDel({
      feed: quest.goblin.id,
      branch: 'activity-monitor',
    });
  }
});

// Create a Goblin with initial state and handlers
module.exports = Goblin.configure(goblinName, logicState, logicHandlers);
