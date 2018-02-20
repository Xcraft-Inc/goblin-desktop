'use strict';

const Goblin = require('xcraft-core-goblin');
const goblinName = 'contexts';
const uuidV4 = require('uuid/v4');

// Define initial logic values
const logicState = {};

// Define logic handlers according rc.json
const logicHandlers = {
  create: (state, action) => {
    const id = action.get('id');
    const desktopId = action.get('desktopId');
    return state.set('', {
      id: id,
      contexts: {},
      desktopId,
      current: null,
    });
  },
  add: (state, action) => {
    const name = action.get('name');
    const contextId = action.get('contextId');
    const current = state.get('current');
    if (!current) {
      return state
        .set('current', contextId)
        .set(`contexts.${contextId}`, {contextId, name});
    }
    return state.set(`contexts.${contextId}`, {contextId, name});
  },
  remove: (state, action) => {
    const widgetId = action.get('widgetId');
    return state.del(`contexts.${widgetId}`);
  },
  'set-current': (state, action) => {
    const contextId = action.get('contextId');
    return state.set('current', contextId);
  },
  delete: state => {
    return state.set('', {});
  },
};

// Register quest's according rc.json

Goblin.registerQuest(goblinName, 'create', function(quest, id, desktopId) {
  quest.goblin.setX('desktopId', desktopId);
  quest.do({id, desktopId});
  return quest.goblin.id;
});

Goblin.registerQuest(goblinName, 'delete', function(quest) {
  quest.log.info('deleting contexts...');
});

Goblin.registerQuest(goblinName, 'set-current', function(quest, contextId) {
  quest.do({contextId});
});

Goblin.registerQuest(goblinName, 'add', function(quest, contextId, name) {
  const deskId = quest.goblin.getX('desktopId');
  const useId = uuidV4();

  quest.create(`taskbar@${useId}`, {
    id: `${contextId}-taskbar@${deskId}`,
    desktopId: quest.goblin.getX('desktopId'),
    contextId: contextId,
  });

  quest.do({contextId, name});
});

Goblin.registerQuest(goblinName, 'remove', function(quest, widgetId) {
  //TODO: look for widgetId
  quest.do({widgetId});
});

// Create a Goblin with initial state and handlers
module.exports = Goblin.configure(goblinName, logicState, logicHandlers);
