'use strict';

const Goblin = require ('xcraft-core-goblin');
const goblinName = 'tasks';
// Define initial logic values
const logicState = {};

// Define logic handlers according rc.json
const logicHandlers = {
  create: (state, action) => {
    const id = action.get ('id');
    return state.set ('', {
      id: id,
      context: action.get ('contextId'),
    });
  },
};

// Register quest's according rc.json

Goblin.registerQuest (goblinName, 'create', function (quest, desktopId) {
  quest.goblin.setX ('desktopId', desktopId);
  quest.do ();
  return quest.goblin.id;
});

Goblin.registerQuest (goblinName, 'delete', function (quest) {
  quest.log.info ('deleting tasks...');
});

Goblin.registerQuest (goblinName, 'run', function (quest, task) {
  if (task.endsWith ('.create')) {
    const goblin = task.split ('.')[0];
    quest.create (goblin, {
      desktopId: quest.goblin.getX ('desktopId'),
    });
  } else {
    quest.cmd (task, {
      desktopId: quest.goblin.getX ('desktopId'),
    });
  }
});

// Create a Goblin with initial state and handlers
module.exports = Goblin.configure (goblinName, logicState, logicHandlers);
