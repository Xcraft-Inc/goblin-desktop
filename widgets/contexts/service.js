'use strict';
//T:2019-02-27

const Goblin = require('xcraft-core-goblin');
const goblinName = 'contexts';

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

Goblin.registerQuest(goblinName, 'delete', function (quest) {
  quest.log.info('deleting contexts...');
});

Goblin.registerQuest(goblinName, 'add', function (
  quest,
  contextId,
  name,
  scope
) {
  quest.do({contextId, name, scope});
});

Goblin.registerQuest(goblinName, 'remove', function (quest, widgetId) {
  //TODO: look for widgetId
  quest.do({widgetId});
});

// Create a Goblin with initial state and handlers
module.exports = Goblin.configure(goblinName, logicState, logicHandlers);
