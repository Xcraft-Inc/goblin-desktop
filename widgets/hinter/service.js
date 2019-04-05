'use strict';

const Goblin = require('xcraft-core-goblin');
const goblinName = 'hinter';
const _ = require('lodash');
// Define initial logic values
const logicState = {};

// Define logic handlers according rc.json
const logicHandlers = require('./logicHandlers.js');

// Register quest's according rc.json

Goblin.registerQuest(goblinName, 'create', function*(
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
  usePayload,
  withDetails,
  filters
) {
  if (!name) {
    name = type;
  }

  if (!filters) {
    filters = ['published'];
  }

  quest.goblin.setX('filters', filters);

  quest.do({
    id,
    name,
    type,
    title,
    glyph,
    kind,
    newWorkitem,
    newButtonTitle,
    withDetails,
    filters,
  });

  const detailId = `${id.replace(`-hinter`, `-detail`)}`;
  quest.goblin.setX('detailId', detailId);
  yield quest.create('detail', {
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
  quest.goblin.setX('name', name);
  quest.goblin.setX('desktopId', desktopId);
  quest.goblin.setX('newWorkitem', newWorkitem);
  quest.goblin.setX('usePayload', usePayload);
  quest.goblin.setX('withDetails', withDetails);
  quest.goblin.setX('cancel', () => null);

  /*hinter@workitem@id*/
  const ids = quest.goblin
    .getState()
    .get('id')
    .split('@');
  const workitem = ids[1];
  const workitemId = `${ids[1]}@${ids.slice(2, ids.length).join('@')}`;
  quest.goblin.setX('workitem', workitem);
  quest.goblin.setX('workitemId', workitemId);
  quest.goblin.setX('loaded', {});

  const goblinId = quest.goblin.id;
  quest.goblin.defer(
    quest.sub(`${quest.goblin.id}.load-detail-requested`, function*(
      err,
      {msg, resp}
    ) {
      yield resp.cmd(`${goblinName}.load-detail`, {id: goblinId, ...msg.data});
    })
  );
  return quest.goblin.id;
});

Goblin.registerQuest(goblinName, 'set-current-detail-entity', function(
  quest,
  entityId
) {
  const detail = quest.getAPI(quest.goblin.getX('detailId'), detail);
  detail.setEntity({entityId});
});

Goblin.registerQuest(goblinName, 'create-new', function*(quest, value) {
  const desk = quest.getAPI(quest.goblin.getX('desktopId'));
  const workitem = quest.goblin.getX('newWorkitem');
  workitem.id = quest.uuidV4();
  workitem.isDone = false;
  workitem.payload = {};
  if (workitem.mapNewValueTo) {
    workitem.payload[workitem.mapNewValueTo] = value;
  }
  yield desk.addWorkitem({workitem, navigate: true});
});

const emitLoadDetails = _.debounce((quest, index, text) => {
  quest.evt('load-detail-requested', {index, text});
}, 300);
Goblin.registerQuest(goblinName, 'select-row', function(quest, index, text) {
  quest.log.info(`Select row: ${index}: ${text}`);
  quest.do({index: `${index}`});
  const withDetails = quest.goblin.getX('withDetails');
  if (withDetails) {
    emitLoadDetails(quest, index);
  }
});

Goblin.registerQuest(goblinName, 'next-row', function(quest) {
  quest.do();
  const withDetails = quest.goblin.getX('withDetails');
  if (withDetails) {
    emitLoadDetails(quest, quest.goblin.getState().get('selectedIndex'));
  }
});
Goblin.registerQuest(goblinName, 'prev-row', function(quest) {
  quest.do();
  const withDetails = quest.goblin.getX('withDetails');
  if (withDetails) {
    emitLoadDetails(quest, quest.goblin.getState().get('selectedIndex'));
  }
});

Goblin.registerQuest(goblinName, 'load-detail', function*(quest, index) {
  const value = quest.goblin.getState().get(`values.${index}`, null);
  const detail = quest.getAPI(quest.goblin.getX('detailId'), 'detail');
  let payload = null;
  const usePayload = quest.goblin.getX('usePayload');
  if (usePayload) {
    payload = quest.goblin.getState().get(`payloads.${index}`, null);
    if (payload) {
      payload = payload.toJS();
    } else {
      quest.goblin.setX('cancel', () => null);
      return;
    }
  }

  const type = quest.goblin.getState().get(`type`, null);
  if (value && type) {
    yield detail.setEntity({entityId: value});
  }
});

Goblin.registerQuest(goblinName, 'validate-row', function*(
  quest,
  index,
  text,
  model
) {
  quest.log.info(`Validate row: ${index}: ${text}`);
  /*hinter@workitem@id*/
  const ids = quest.goblin
    .getState()
    .get('id')
    .split('@');
  const workitem = ids[1];
  const workitemId = `${ids[1]}@${ids.slice(2, ids.length).join('@')}`;
  const value = quest.goblin.getState().get(`values.${index}`, null);

  let payload = {};
  const usePayload = quest.goblin.getX('usePayload');
  if (usePayload) {
    payload = quest.goblin.getState().get(`payloads.${index}`, null);
    if (payload) {
      payload = payload.toJS();
    }
  }

  const type = quest.goblin.getState().get(`type`, null);
  if (value && type) {
    const name = quest.goblin.getX('name');
    const cmd = `${workitem}.hinter-validate-${name}`;
    if (quest.resp.getCommandsNames()[cmd]) {
      yield quest.cmd(cmd, {
        id: workitemId,
        selection: {index, text, value, payload},
      });
    }
  }
});

Goblin.registerQuest(goblinName, 'set-filters', function*(quest, filters) {
  quest.goblin.setX('filters', filters);
  const lastSelections = quest.goblin.getX('lastSelections');
  if (lastSelections) {
    yield quest.me.setSelections(lastSelections);
  }
});

Goblin.registerQuest(goblinName, 'set-selections', function*(
  quest,
  rows,
  glyphs,
  status,
  values,
  payloads,
  usePayload,
  validate
) {
  const filters = quest.goblin.getX('filters');
  quest.goblin.setX('lastSelections', {
    rows,
    glyphs,
    status,
    values,
    payloads,
    usePayload,
    validate,
  });
  const indexes = status
    ? status.reduce((indexes, s, i) => {
        if (filters.includes(s) || s === undefined) {
          indexes.push(i);
        }
        return indexes;
      }, [])
    : rows.map((_, i) => i);

  if (indexes.length !== rows.length) {
    rows = rows.filter((_, i) => indexes.includes(i));
    glyphs = glyphs.filter((_, i) => indexes.includes(i));
    values = values.filter((_, i) => indexes.includes(i));
    status = status.filter((_, i) => indexes.includes(i));
    payloads = payloads.filter((_, i) => indexes.includes(i));
  }

  quest.do({rows, glyphs, values, status, payloads});
  if (rows.length > 0) {
    yield quest.me.selectRow({
      index: 0,
      text: rows[0],
      payload: usePayload ? payloads[0] : {},
      usePayload,
    });
    if (validate) {
      yield quest.me.validateRow({
        index: 0,
        text: rows[0],
      });
    }
  }
});

Goblin.registerQuest(goblinName, 'delete', function(quest) {
  quest.log.info('Deleting hinter...');
});

// Create a Goblin with initial state and handlers
module.exports = Goblin.configure(goblinName, logicState, logicHandlers);
