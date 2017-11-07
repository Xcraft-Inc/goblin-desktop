'use strict';

const Goblin = require ('xcraft-core-goblin');
const goblinName = 'detail';

// Define initial logic values
const logicState = {};

// Define logic handlers according rc.json
const logicHandlers = {
  create: (state, action) => {
    const id = action.get ('id');
    return state.set ('', {
      id: id,
      type: action.get ('type'),
      title: action.get ('title'),
      detailWidget: action.get ('detailWidget'),
      detailWidgetId: null,
      entityId: null,
      kind: action.get ('kind'),
      width: action.get ('width'),
    });
  },
  'set-entity': (state, action) => {
    return state
      .set ('detailWidgetId', action.get ('widgetId'))
      .set ('entityId', action.get ('entityId'))
      .set ('loading', false);
  },
  'set-loading': state => {
    return state.set ('loading', true);
  },
};

// Register quest's according rc.json

Goblin.registerQuest (goblinName, 'create', function (
  quest,
  desktopId,
  id,
  type,
  title,
  detailWidget,
  kind,
  width
) {
  quest.goblin.setX ('desktopId', desktopId);
  quest.do ({id, type, title, detailWidget, kind, width});
  return quest.goblin.id;
});

Goblin.registerQuest (goblinName, 'set-entity', function* (
  quest,
  entityId,
  entity
) {
  const desktopId = quest.goblin.getX ('desktopId');
  const type = entityId.split ('@')[0];
  const workitemId = `${type}-workitem@${entityId}@${desktopId}`;
  const existing = yield quest.warehouse.get ({path: workitemId});
  if (!existing) {
    yield quest.create (workitemId, {
      id: workitemId,
      desktopId,
      entityId: entityId,
      entity,
    });
  }
  quest.do ({widgetId: workitemId, entityId});
});

Goblin.registerQuest (goblinName, 'set-loading', function (quest) {
  quest.do ();
});

Goblin.registerQuest (goblinName, 'delete', function (quest) {
  quest.log.info ('Deleting detail...');
});

// Create a Goblin with initial state and handlers
module.exports = Goblin.configure (goblinName, logicState, logicHandlers);
