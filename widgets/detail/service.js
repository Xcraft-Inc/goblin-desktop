'use strict';

const Goblin = require('xcraft-core-goblin');
const {locks} = require('xcraft-core-utils');
const goblinName = 'detail';

// Define initial logic values
const logicState = {};

// Define logic handlers according rc.json
const logicHandlers = {
  create: (state, action) => {
    const id = action.get('id');
    return state.set('', {
      id: id,
      type: action.get('type'),
      title: action.get('title'),
      detailWidget: action.get('detailWidget'),
      detailWidgetId: null,
      entityId: null,
      kind: action.get('kind'),
      width: action.get('width'),
    });
  },
  'set-entity': (state, action) => {
    return state
      .set('detailWidgetId', action.get('widgetId'))
      .set('entityId', action.get('entityId'));
  },
  'set-loading': state => {
    return state.set('loading', true);
  },
  'clear-loading': state => {
    return state.set('loading', false);
  },
};

// Register quest's according rc.json

Goblin.registerQuest(goblinName, 'create', function(
  quest,
  desktopId,
  id,
  name,
  type,
  title,
  detailWidget,
  kind,
  width
) {
  if (!name) {
    name = type;
  }
  quest.goblin.setX('desktopId', desktopId);
  quest.goblin.setX('name', desktopId);
  quest.do({id, type, title, detailWidget, kind, width});
  return quest.goblin.id;
});

const setMutex = new locks.RecursiveMutex();
Goblin.registerQuest(goblinName, 'set-entity', function*(quest, entityId) {
  yield setMutex.lock(entityId);
  quest.defer(() => setMutex.unlock(entityId));
  const desktopId = quest.goblin.getX('desktopId');
  const type = entityId.split('@')[0];
  const workitemId = `${type}-workitem@readonly@${desktopId}`;
  const existing = quest.goblin.getState().get('detailWidgetId');
  quest.me.setLoading();
  if (existing) {
    const wiAPI = quest.getAPI(workitemId);
    yield wiAPI.changeEntity({entityId});
  } else {
    yield quest.create(workitemId, {
      id: workitemId,
      desktopId,
      entityId: entityId,
      mode: 'readonly',
    });
  }
  quest.me.clearLoading();
  quest.do({widgetId: workitemId, entityId});
});

Goblin.registerQuest(goblinName, 'set-loading', function(quest) {
  quest.do();
});

Goblin.registerQuest(goblinName, 'clear-loading', function(quest) {
  quest.do();
});

Goblin.registerQuest(goblinName, 'delete', function(quest) {
  quest.log.info('Deleting detail...');
});

// Create a Goblin with initial state and handlers
module.exports = Goblin.configure(goblinName, logicState, logicHandlers);
