'use strict';
//T:2019-02-27
const Goblin = require('xcraft-core-goblin');
const goblinName = 'tabs';
// Define initial logic values
const logicState = {};

// Define logic handlers according rc.json
const logicHandlers = require('./logic-handlers.js');

// Register quest's according rc.json

Goblin.registerQuest(goblinName, 'create', function(quest, id, desktopId) {
  quest.goblin.setX('desktopId', desktopId);
  quest.do({id, desktopId});
  return quest.goblin.id;
});

Goblin.registerQuest(goblinName, 'delete', function(quest) {});

Goblin.registerQuest(goblinName, 'set-current', function(
  quest,
  contextId,
  workitemId
) {
  quest.do({contextId, workitemId});
});

Goblin.registerQuest(goblinName, 'add', function(quest, workitemId) {
  quest.do({
    tabId: workitemId,
  });
  return workitemId;
});

Goblin.registerQuest(goblinName, 'remove', function*(
  quest,
  tabId,
  contextId,
  workitemId,
  navToLastWorkitem,
  close
) {
  const desktopId = quest.getDesktop();
  const deskAPI = quest.getAPI(desktopId);
  const wi = quest.getAPI(workitemId);

  try {
    if (close && wi) {
      if (wi.close) {
        yield wi.close({kind: 'terminate', desktopId});
      } else {
        const nameId = workitemId.split('@');
        yield deskAPI.removeWorkitem({
          workitem: {
            id: workitemId.replace(nameId[0] + '@', ''),
            name: nameId[0],
            kind: 'tab',
            contextId: contextId,
          },
          close: false,
        });
      }
    }
  } catch (ex) {
    quest.log.warn(ex.message || ex.stack || ex);
  }

  if (tabId) {
    quest.do();
  }

  quest.evt('removed', {workitemId});

  const desk = quest.getAPI(desktopId);
  yield desk.cleanWorkitem({workitemId});

  if (navToLastWorkitem) {
    yield desk.navToLastWorkitem();
  } else {
    // Navigate last tab
    const contextTabs = quest.goblin.getState().get(`tabs.${contextId}`);
    if (!contextTabs) {
      return;
    }
    const newLast = contextTabs.state.last();

    if (newLast) {
      yield desk.navToWorkitem({
        contextId: contextId,
        view: newLast.get('view'),
        workitemId: newLast.get('workitemId'),
      });
    } else {
      yield desk.clearWorkitem({contextId});
    }
  }
});

// Create a Goblin with initial state and handlers
module.exports = Goblin.configure(goblinName, logicState, logicHandlers);
