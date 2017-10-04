'use strict';

const Goblin = require ('xcraft-core-goblin');
const goblinName = 'hinter';
const actions = require ('react-redux-form/immutable').actions;

// Define initial logic values
const logicState = {};

// Define logic handlers according rc.json
const logicHandlers = {
  create: (state, action) => {
    const id = action.get ('id');
    return state.set ('', {
      id: id,
      type: action.get ('type'),
      kind: action.get ('kind'),
      title: action.get ('title'),
      glyph: action.get ('glyph'),
      onNew: !!action.get ('newWorkitem'),
      newButtonTitle: action.get ('newButtonTitle'),
      rows: [],
      selectedIndex: null,
      values: [],
    });
  },
  'set-selections': (state, action) => {
    return state
      .set ('rows', action.get ('rows'))
      .set ('values', action.get ('values'))
      .set ('payloads', action.get ('payloads'))
      .set ('selectedIndex', '0');
  },
  'select-row': (state, action) => {
    return state.set ('selectedIndex', action.get ('index'));
  },
  delete: state => {
    return state.set ('', {});
  },
};

// Register quest's according rc.json

Goblin.registerQuest (goblinName, 'create', function (
  quest,
  id,
  desktopId,
  type,
  title,
  glyph,
  kind,
  detailWidget,
  detailKind,
  detailWidth,
  newWorkitem,
  newButtonTitle,
  usePayload
) {
  quest.do ({id, type, title, glyph, kind, newWorkitem, newButtonTitle});
  quest.create ('detail', {
    id: `${id.replace ('-hinter', '-detail')}`,
    desktopId,
    type,
    title,
    detailWidget,
    kind: detailKind,
    width: detailWidth,
  });
  quest.goblin.setX ('desktopId', desktopId);
  quest.goblin.setX ('workitem', newWorkitem);
  quest.goblin.setX ('usePayload', usePayload);
  return quest.goblin.id;
});

Goblin.registerQuest (goblinName, 'set-current-detail-entity', function (
  quest,
  entityId
) {
  const detail = quest.use ('detail');
  detail.setEntity ({entityId});
});

Goblin.registerQuest (goblinName, 'create-new', function (quest, value) {
  const desk = quest.useAs ('desktop', quest.goblin.getX ('desktopId'));
  const workitem = quest.goblin.getX ('workitem');
  workitem.id = quest.uuidV4 ();
  workitem.isDone = false;
  workitem.payload = {};
  if (workitem.mapNewValueTo) {
    workitem.payload[workitem.mapNewValueTo] = value;
  }
  desk.addWorkitem ({workitem, navigate: true});

  quest.sub (`${workitem.name}@${workitem.id}.closed`, (err, msg) => {
    const entity = msg.data;
    const rows = [];
    rows.push ('new');
    const values = [];
    values.push (entity.id);
    const payloads = [];
    payloads.push (entity);
    quest.me.setSelections ({
      rows,
      values,
      payloads,
      usePayload: true,
      validate: true,
    });
  });
});

Goblin.registerQuest (goblinName, 'select-row', function (quest, index, text) {
  quest.log.info (`Select row: ${index}: ${text}`);
  quest.do ({index: `${index}`});
  /*hinter@workitem@id*/
  const ids = quest.goblin.getState ().get ('id').split ('@');
  const workitem = ids[1];
  const workitemId = `${ids[1]}@${ids.slice (2, ids.length).join ('@')}`;
  const value = quest.goblin.getState ().get (`values.${index}`, null);

  let payload = null;
  const usePayload = quest.goblin.getX ('usePayload');
  if (usePayload) {
    payload = quest.goblin.getState ().get (`payloads.${index}`, null).toJS ();
  }

  const type = quest.goblin.getState ().get (`type`, null);
  if (value && type) {
    quest.cmd (`${workitem}.hinter-select-${type}`, {
      id: workitemId,
      selection: {index, text, value},
    });
    const detail = quest.use ('detail');
    detail.setEntity ({entityId: value, entity: payload});
  }
});

Goblin.registerQuest (goblinName, 'validate-row', function (
  quest,
  index,
  text,
  model
) {
  quest.log.info (`Validate row: ${index}: ${text}`);
  /*hinter@workitem@id*/
  const ids = quest.goblin.getState ().get ('id').split ('@');
  const workitem = ids[1];
  const workitemId = `${ids[1]}@${ids.slice (2, ids.length).join ('@')}`;
  const value = quest.goblin.getState ().get (`values.${index}`, null);
  const payload = quest.goblin
    .getState ()
    .get (`payloads.${index}`, null)
    .toJS ();
  const type = quest.goblin.getState ().get (`type`, null);
  if (value && type) {
    quest.cmd (`${workitem}.hinter-validate-${type}`, {
      id: workitemId,
      selection: {index, text, value, payload},
    });
    if (model) {
      const desktopId = quest.goblin.getX ('desktopId');
      const desk = quest.useAs ('desktop', desktopId);
      desk.dispatch ({action: actions.change (model, text)});
    }
  }
});

Goblin.registerQuest (goblinName, 'set-selections', function (
  quest,
  rows,
  values,
  payloads,
  usePayload,
  validate
) {
  quest.do ({rows, values, payloads});
  if (rows.length > 0) {
    quest.me.selectRow ({
      index: 0,
      text: rows[0],
      payload: payloads[0],
      usePayload,
    });
    if (validate) {
      quest.me.validateRow ({
        index: 0,
        text: rows[0],
      });
    }
  }
});

Goblin.registerQuest (goblinName, 'delete', function (quest) {
  quest.log.info ('Deleting hinter...');
});

// Create a Goblin with initial state and handlers
module.exports = Goblin.configure (goblinName, logicState, logicHandlers);
