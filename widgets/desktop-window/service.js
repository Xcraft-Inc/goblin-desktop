'use strict';
//T:2019-02-27

const Goblin = require('xcraft-core-goblin');
const goblinName = 'desktop-window';

const defaultRoutes = {
  workitem: '/content/:context/:view',
  hinter: '/hinter/:context/:view/:hinter',
};

// Define initial logic values
const logicState = {};

// Define logic handlers according rc.json
const logicHandlers = {
  create: (state, action) => {
    const id = action.get('id');
    const workitemId = action.get('workitemId');
    const view = action.get('view');
    const contextId = action.get('contextId');
    return state.set('', {
      id: id,
      view,
      contextId,
      workitemId,
      routes: defaultRoutes,
    });
  },
};

// Register quest's according rc.json

Goblin.registerQuest(goblinName, 'create', function* (
  quest,
  desktopId,
  contextId,
  view,
  workitemId
) {
  yield quest.create(workitemId, {id: workitemId, desktopId});
  quest.do({view, contextId, workitemId});
  return quest.goblin.id;
});

Goblin.registerQuest(goblinName, 'init-window', function (quest) {
  const {contextId, view, workitemId} = quest.goblin.getState().toJS();
  quest.evt.full(`<${quest.goblin.id}>.nav.requested`, {
    route: `/${contextId}/${view}?wid=${workitemId}`,
  });
});

Goblin.registerQuest(goblinName, 'delete', function (quest) {});

// Create a Goblin with initial state and handlers
module.exports = Goblin.configure(goblinName, logicState, logicHandlers);
