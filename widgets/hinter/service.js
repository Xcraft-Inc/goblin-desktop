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
      name: action.get ('name'),
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
      .set ('glyphs', action.get ('glyphs'))
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
  name,
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
  if (!name) {
    name = type;
  }
  quest.do ({id, name, type, title, glyph, kind, newWorkitem, newButtonTitle});
  const detailId = `${id.replace (`-hinter`, `-detail`)}`;
  quest.goblin.setX ('detailId', detailId);
  quest.create ('detail', {
    id: detailId,
    desktopId,
    name,
    type,
    title,
    detailWidget,
    kind: detailKind,
    width: detailWidth,
  });

  if (!name) {
    name = type;
  }
  quest.goblin.setX ('name', name);
  quest.goblin.setX ('desktopId', desktopId);
  quest.goblin.setX ('newWorkitem', newWorkitem);
  quest.goblin.setX ('usePayload', usePayload);
  quest.goblin.setX ('cancel', () => null);

  /*hinter@workitem@id*/
  const ids = quest.goblin.getState ().get ('id').split ('@');
  const workitem = ids[1];
  const workitemId = `${ids[1]}@${ids.slice (2, ids.length).join ('@')}`;
  quest.goblin.setX ('workitem', workitem);
  quest.goblin.setX ('workitemId', workitemId);
  quest.goblin.setX ('loaded', {});

  return quest.goblin.id;
});

Goblin.registerQuest (goblinName, 'set-current-detail-entity', function (
  quest,
  entityId
) {
  const detail = quest.getAPI ('detail');
  detail.setEntity ({entityId});
});

Goblin.registerQuest (goblinName, 'create-new', function (quest, value) {
  const desk = quest.getGoblinAPI ('desktop', quest.goblin.getX ('desktopId'));
  const workitem = quest.goblin.getX ('newWorkitem');
  workitem.id = quest.uuidV4 ();
  workitem.isDone = false;
  workitem.payload = {};
  if (workitem.mapNewValueTo) {
    workitem.payload[workitem.mapNewValueTo] = value;
  }
  desk.addWorkitem ({workitem, navigate: true});

  const sub = quest.sub (
    `${workitem.name}@${workitem.id}.validated`,
    (err, msg) => {
      const entity = msg.data;
      const rows = [''];
      const values = [entity.id];
      const payloads = [entity];
      quest.me.setSelections ({
        rows,
        values,
        payloads,
        usePayload: true,
        validate: true,
      });
    }
  );
  quest.goblin.defer (sub);
});

Goblin.registerQuest (goblinName, 'select-row', function (quest, index, text) {
  quest.log.info (`Select row: ${index}: ${text}`);
  quest.do ({index: `${index}`});

  const value = quest.goblin.getState ().get (`values.${index}`, null);
  const loaded = quest.goblin.getX ('loaded');
  const detail = quest.getAPI ('detail');
  if (loaded[value] !== undefined) {
    detail.setEntity ({entityId: value, entity: loaded[value]});
    return;
  }
  //CANCEL PREVIOUS SELECT-ROW TASK
  quest.goblin.getX ('cancel') ();

  detail.setLoading ();

  const task = () => {
    console.log ('runnin select row task:', index);
    let payload = null;
    const usePayload = quest.goblin.getX ('usePayload');
    if (usePayload) {
      payload = quest.goblin.getState ().get (`payloads.${index}`, null);
      if (payload) {
        payload = payload.toJS ();
      } else {
        quest.goblin.setX ('cancel', () => null);
        return;
      }
    }

    const type = quest.goblin.getState ().get (`type`, null);
    if (value && type) {
      const workitem = quest.goblin.getX ('workitem');
      const workitemId = quest.goblin.getX ('workitemId');
      const name = quest.goblin.getX ('name');
      quest.cmd (`${workitem}.hinter-select-${name}`, {
        id: workitemId,
        selection: {index, text, value},
      });
      loaded[value] = payload;
      quest.goblin.setX ('loaded', loaded);
      detail.setEntity ({entityId: value, entity: payload});
    }

    quest.goblin.setX ('cancel', () => null);
  };

  //Prepare a cancelable load task
  new Promise (resolve => {
    const cancelId = setTimeout (resolve, 500, task);
    quest.goblin.setX ('cancel', () => {
      console.log ('canceling select-row task');
      clearTimeout (cancelId);
    });
  }).then (task => task ());
});

Goblin.registerQuest (goblinName, 'validate-row', function* (
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

  let payload = {};
  const usePayload = quest.goblin.getX ('usePayload');
  if (usePayload) {
    payload = quest.goblin.getState ().get (`payloads.${index}`, null).toJS ();
  }

  const type = quest.goblin.getState ().get (`type`, null);
  if (value && type) {
    const name = quest.goblin.getX ('name');
    yield quest.cmd (`${workitem}.hinter-validate-${name}`, {
      id: workitemId,
      selection: {index, text, value, payload},
    });
    if (model) {
      //const desktopId = quest.goblin.getX ('desktopId');
      //const desk = quest.useAs ('desktop', desktopId);
      //desk.dispatch ({action: actions.change (model, text)});
    }
  }
});

Goblin.registerQuest (goblinName, 'set-selections', function (
  quest,
  rows,
  glyphs,
  values,
  payloads,
  usePayload,
  validate
) {
  quest.do ({rows, glyphs, values, payloads});
  if (rows.length > 0) {
    quest.me.selectRow ({
      index: 0,
      text: rows[0],
      payload: usePayload ? payloads[0] : {},
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
