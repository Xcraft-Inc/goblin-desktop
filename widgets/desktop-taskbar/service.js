'use strict';
const path = require('path');
const Goblin = require('xcraft-core-goblin');
const goblinName = path.basename(module.parent.filename, '.js');

// Define initial logic values
const logicState = {};

// Define logic handlers according rc.json
const logicHandlers = {
  create: (state, action) => {
    const id = action.get('id');
    return state.set('', {id});
  },
};

/******************************************************************************/

// Register quest's according rc.json
Goblin.registerQuest(goblinName, 'create', function(quest, id) {
  quest.do({id});
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
