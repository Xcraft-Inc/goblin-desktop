'use strict';

const Goblin = require ('xcraft-core-goblin');
const goblinName = 'taskbar';
const uuidV4 = require ('uuid/v4');

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

Goblin.registerQuest (goblinName, 'run', function (quest, workitem, contextId) {
  const desk = quest.useAs ('desktop', quest.goblin.getX ('desktopId'));
  workitem.id = uuidV4 ();
  workitem.isDone = false;
  workitem.contextId = contextId;
  desk.addWorkitem ({workitem});
});

// Create a Goblin with initial state and handlers
module.exports = Goblin.configure (goblinName, logicState, logicHandlers);
