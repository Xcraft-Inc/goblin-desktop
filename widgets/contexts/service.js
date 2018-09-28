'use strict';

const Goblin = require('xcraft-core-goblin');
const goblinName = 'contexts';
const uuidV4 = require('uuid/v4');

// Define initial logic values
const logicState = {};

// Define logic handlers according rc.json
const logicHandlers = require('./logicHandlers.js');

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
