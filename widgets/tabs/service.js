'use strict';

const Goblin = require('xcraft-core-goblin');
const goblinName = 'tabs';
// Define initial logic values
const logicState = {};

// Define logic handlers according rc.json
const logicHandlers = require('./logicHandlers');

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

Goblin.registerQuest(goblinName, 'add', function(
  quest,
  contextId,
  name,
  view,
  workitemId,
  entityId,
  closable,
  glyph
) {
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
  const wi = quest.getAPI(workitemId);
  let released = false;
  if (close && wi && wi.close) {
    yield wi.close({kind: 'terminate', desktopId});
    released = true;
  }

  if (tabId) {
    const tabButton = quest.getAPI(tabId);
    if (close && tabButton && !released) {
      quest.release(tabId);
    }
    quest.do();
  }

  quest.evt('removed', {workitemId});

  const desk = quest.getAPI(desktopId);
  desk.cleanWorkitem({workitemId});

  if (navToLastWorkitem) {
    desk.navToLastWorkitem();
  } else {
    // Navigate last tab
    const contextTabs = quest.goblin.getState().get(`tabs.${contextId}`);
    if (!contextTabs) {
      return;
    }
    const newLast = contextTabs.state.last();

    if (newLast) {
      desk.navToWorkitem({
        contextId: contextId,
        view: newLast.get('view'),
        workitemId: newLast.get('workitemId'),
      });
    } else {
      desk.clearWorkitem({contextId});
    }
  }
});

// Create a Goblin with initial state and handlers
module.exports = Goblin.configure(goblinName, logicState, logicHandlers);
