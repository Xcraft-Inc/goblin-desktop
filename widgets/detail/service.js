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
      kind: action.get ('kind'),
      width: action.get ('width'),
    });
  },
  'set-entity': (state, action) => {
    return state.set ('detailWidgetId', action.get ('widgetId'));
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
  const detailWidget = quest.goblin.getState ().get ('detailWidget');

  if (quest.canUse (`${detailWidget}@${entityId}`)) {
    const detail = quest.use (`${detailWidget}@${entityId}`);
    quest.goblin.setX ('widget', {id: detail.id, name: detailWidget});
    quest.do ({widgetId: detail.id});
    return;
  }
  const desktopId = quest.goblin.getX ('desktopId');
  const newWidget = yield quest.create (`${detailWidget}@${entityId}`, {
    desktopId,
    entityId,
    entity,
  });
  quest.goblin.defer (newWidget.delete);
  quest.goblin.setX ('widget', {id: newWidget.id, name: detailWidget});
  quest.do ({widgetId: newWidget.id});
});

Goblin.registerQuest (goblinName, 'delete', function (quest) {
  quest.log.info ('Deleting detail...');
});

// Create a Goblin with initial state and handlers
module.exports = Goblin.configure (goblinName, logicState, logicHandlers);
