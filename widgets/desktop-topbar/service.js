'use strict';
//T:2019-02-27
const path = require('path');
const Goblin = require('xcraft-core-goblin');
const goblinName = path.basename(module.parent.filename, '.js');

// Define initial logic values
const logicState = {};

// Define logic handlers according rc.json
const logicHandlers = {
  'change-team': (state, action) => {
    return state.set('teamId', action.get('teamId'));
  },
};

/******************************************************************************/

// Register quest's according rc.json
Goblin.registerQuest(goblinName, 'create', function(quest) {
  return quest.goblin.id;
});

/******************************************************************************/

Goblin.registerQuest(goblinName, 'change-locale', function(quest, locale) {
  const clientSessionId = quest.goblin.getX('clientSessionId');
  quest.evt(`${clientSessionId}.user-locale-changed`, {locale});
});

/******************************************************************************/

Goblin.registerQuest(goblinName, 'change-theme', function(quest, name) {
  quest.evt(`change-theme.requested`, {
    name,
  });
});

/******************************************************************************/

Goblin.registerQuest(goblinName, 'change-team', function(quest, teamId) {
  quest.do();
});

/******************************************************************************/

Goblin.registerQuest(goblinName, 'change-screen', function(quest) {
  quest.evt(`screen.changed`);
});

/******************************************************************************/

Goblin.registerQuest(goblinName, 'delete', function(quest) {});

/******************************************************************************/

// Create a Goblin with initial state and handlers
module.exports = Goblin.configure(goblinName, logicState, logicHandlers);
