'use strict';

const Goblin = require ('xcraft-core-goblin');
const goblinName = 'tabs';
// Define initial logic values
const logicState = {};

// Define logic handlers according rc.json
const logicHandlers = {
  create: (state, action) => {
    const id = action.get ('id');
    const desktopId = action.get ('desktopId');
    return state.set ('', {
      id: id,
      tabs: {},
      desktopId,
      current: {},
    });
  },
  add: (state, action) => {
    const tabId = action.get ('tabId');
    const contextId = action.get ('contextId');
    const current = state.get (`current.${contextId}`, null);
    const tab = {
      id: tabId,
      name: action.get ('name'),
      view: action.get ('view'),
      workitemId: action.get ('workitemId'),
      closable: action.get ('closable'),
      glyph: action.get ('glyph'),
    };
    if (!current) {
      return state
        .set (`current.${contextId}`, action.get ('workitemId'))
        .set (`tabs.${contextId}.${tabId}`, tab);
    }
    return state.set (`tabs.${contextId}.${tabId}`, tab);
  },
  'set-current': (state, action) => {
    const wid = action.get ('workitemId');
    const contextId = action.get ('contextId');
    return state.set (`current.${contextId}`, wid);
  },
  remove: (state, action) => {
    const tabId = action.get ('tabId');
    const contextId = action.get ('contextId');
    return state.del (`tabs.${contextId}.${tabId}`);
  },
  delete: state => {
    return state.set ('', {});
  },
};

// Register quest's according rc.json

Goblin.registerQuest (goblinName, 'create', function (quest, id, desktopId) {
  quest.goblin.setX ('desktopId', desktopId);
  quest.do ({id, desktopId});
  return quest.goblin.id;
});

Goblin.registerQuest (goblinName, 'delete', function (quest, id) {
  quest.do ({id});
});

Goblin.registerQuest (goblinName, 'set-current', function (
  quest,
  contextId,
  workitemId
) {
  quest.do ({contextId, workitemId});
});

Goblin.registerQuest (goblinName, 'add', function (
  quest,
  contextId,
  name,
  view,
  workitemId,
  closable,
  glyph
) {
  quest.do ({
    tabId: workitemId,
  });
  return workitemId;
});

Goblin.registerQuest (goblinName, 'remove', function (
  quest,
  tabId,
  contextId,
  workitemId,
  navToLastWorkitem
) {
  const i = quest.openInventory ();
  const tabButton = i.getAPI (tabId);
  if (tabButton) {
    tabButton.delete ();
  }

  quest.evt ('removed', {workitemId});

  quest.do ();

  const desktopId = quest.goblin.getX ('desktopId');
  const desk = quest.getGoblinAPI ('desktop', desktopId);

  if (navToLastWorkitem) {
    desk.navToLastWorkitem ();
  } else {
    // Navigate last tab
    const contextTabs = quest.goblin.getState ().get (`tabs.${contextId}`);
    if (!contextTabs) {
      return;
    }
    const newLast = contextTabs.state.last ();

    if (newLast) {
      desk.navToWorkitem ({
        contextId: contextId,
        view: newLast.get ('view'),
        workitemId: newLast.get ('workitemId'),
      });
    } else {
      desk.clearWorkitem ({contextId});
    }
  }
});

// Create a Goblin with initial state and handlers
module.exports = Goblin.configure (goblinName, logicState, logicHandlers);
