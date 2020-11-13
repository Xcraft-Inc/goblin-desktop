'use strict';
//T:2019-02-27
const Goblin = require('xcraft-core-goblin');
const goblinName = 'tabs';
// Define initial logic values
const logicState = {};

// Define logic handlers according rc.json
const logicHandlers = require('./logic-handlers.js');

// Register quest's according rc.json

Goblin.registerQuest(goblinName, 'create', function (quest, id, desktopId) {
  quest.goblin.setX('desktopId', desktopId);
  quest.do({id, desktopId});
  return quest.goblin.id;
});

Goblin.registerQuest(goblinName, 'add', function (quest, workitemId) {
  quest.do({
    tabId: workitemId,
  });
  return workitemId;
});

Goblin.registerQuest(goblinName, 'remove', function* (
  quest,
  tabId,
  contextId,
  workitemId,
  navToLastWorkitem,
  close
) {
  const desktopId = quest.getDesktop();
  const deskAPI = quest.getAPI(desktopId);

  try {
    const nameId = workitemId.split('@');
    yield deskAPI.removeWorkitem({
      workitem: {
        id: workitemId.replace(nameId[0] + '@', ''),
        name: nameId[0],
        kind: 'tab',
        contextId: contextId,
      },
      close,
      navToLastWorkitem,
    });
  } catch (ex) {
    quest.log.warn(ex.message || ex.stack || ex);
  }

  yield quest.me.clean({contextId, tabId});
});

Goblin.registerQuest(goblinName, 'clean', function* (quest, tabId, contextId) {
  yield quest.doSync({tabId, contextId});
});

Goblin.registerQuest(goblinName, 'delete', function (quest) {});

// Create a Goblin with initial state and handlers
module.exports = Goblin.configure(goblinName, logicState, logicHandlers);
