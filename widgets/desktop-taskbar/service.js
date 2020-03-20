'use strict';
const path = require('path');
const Goblin = require('xcraft-core-goblin');
const goblinName = path.basename(module.parent.filename, '.js');

// Define initial logic values
const logicState = {};

// Define logic handlers according rc.json
const logicHandlers = require('./logic-handlers.js');

/******************************************************************************/

// Register quest's according rc.json
Goblin.registerQuest(goblinName, 'create', function(quest) {
  return quest.goblin.id;
});

/******************************************************************************/

Goblin.registerQuest(goblinName, 'change-mandate', function(quest) {
  quest.evt(`mandate.changed`);
});

/******************************************************************************/

Goblin.registerQuest(goblinName, 'delete', function(quest) {});

/******************************************************************************/

// Create a Goblin with initial state and handlers
module.exports = Goblin.configure(goblinName, logicState, logicHandlers);
