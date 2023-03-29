'use strict';
//T:2019-02-27

const Goblin = require('xcraft-core-goblin');
const goblinName = 'taskbar';
const {v4: uuidV4} = require('uuid');

const getPrefiltersFromTable = ((r, dbName, table) => {
  return r.db(dbName).table(table).getAll()('id');
}).toString();

const logicState = {
  table: null, // Type of entity
  listId: null, // Id of list service
  prefilters: [], // List of existing prefilter ids for current table
  selectedPrefilterId: null, // Id of current prefilter applied to list
  loading: true, // Boolean to disable actions during quest execution
};

const logicHandlers = {
  create: (state, action) => {
    return state.set('', {
      id: action.get('id'),
      table: action.get('table'),
      listId: action.get('listId'),
      prefilters: action.get('prefilters'),
      loading: false,
    });
  },
  change: (state, action) => {
    return state.set(action.get('path'), action.get('newValue'));
  },
  createNewPrefilter: (state, action) => {
    return state.push('prefilters', action.get('prefilterId'));
  },
  applyPrefilterOnList: (state, action) => {
    return state.set('selectedPrefilterId', action.get('prefilterId'));
  },
  clearPrefilterOnList: (state, action) => {
    return state.set('selectedPrefilterId', null);
  },
  deletePrefilter: (state, action) => {
    const prefilters = state.get('prefilters');
    const i = prefilters.findIndex((id) => id === action.get('prefilterId'));
    if (i === -1) {
      return state;
    }
    return state.set('prefilters', prefilters.delete(i));
  },
};

Goblin.registerQuest(goblinName, 'create', function* (
  quest,
  desktopId,
  table,
  listId
) {
  quest.goblin.setX('desktopId', desktopId);
  // TODO: Get storage type
  const r = quest.getStorage('rethink');
  const dbName = quest.getSession();

  // Get list of prefilters from current table
  const prefilters = yield r.query({
    query: getPrefiltersFromTable,
    args: [dbName, table],
  });

  // TODO: Instanciate prefilter entities
  quest.do({table, listId, prefilters});
});

Goblin.registerQuest(goblinName, 'change', function (quest) {
  quest.do();
});

Goblin.registerQuest(goblinName, 'togglePrefilter', function* (
  quest,
  prefilterId
) {
  const state = quest.goblin.getState();
  // Apply or remove prefilter on list
  if (state.get('selectedPrefilterId') !== prefilterId) {
    yield quest.me.applyPrefilterOnList({prefilterId});
  } else {
    yield quest.me.clearPrefilterOnList();
  }
});

Goblin.registerQuest(goblinName, 'applyPrefilterOnList', function* (
  quest,
  prefilterId
) {
  const prefilterAPI = yield quest.createEntity(prefilterId);
  const prefilterState = yield prefilterAPI.get();
  const {filters, sort} = prefilterState.pick('filters', 'sort');
  const state = quest.goblin.getState();
  const listAPI = quest.getAPI(state.get('listId'));
  yield listAPI.setFiltersAndSort({filters, sort});
  quest.do();
});

Goblin.registerQuest(goblinName, 'clearPrefilterOnList', function* (quest) {
  const state = quest.goblin.getState();
  const listAPI = quest.getAPI(state.get('listId'));
  yield listAPI.resetFiltersAndSort();
  quest.do();
});

Goblin.registerQuest(goblinName, 'createNewPrefilter', function* (quest) {
  const state = quest.goblin.getState();
  const prefilterId = `prefilter@${uuidV4()}`;
  const table = state.get('table');
  const listAPI = quest.getAPI(state.get('listId'));
  const {filters, sort} = listAPI.getFiltersAndSort();
  yield quest.createEntity(prefilterId, {
    table,
    filters,
    sort,
  });
  quest.do({prefilterId});
});

Goblin.registerQuest(goblinName, 'editPrefilterName', function* (
  quest,
  prefilterId,
  name
) {
  const prefilterAPI = yield quest.createEntity(prefilterId);
  yield prefilterAPI.change({path: 'name', newValue: name});
});

Goblin.registerQuest(goblinName, 'savePrefilter', function* (
  quest,
  prefilterId
) {
  const state = quest.goblin.getState();
  // options.filters and options.sort of list service
  const listAPI = quest.getAPI(state.get('listId'));
  const {filters, sort} = listAPI.getFiltersAndSort();
  const prefilterAPI = yield quest.createEntity(prefilterId);
  yield prefilterAPI.apply({patch: {filters, sort}});
});

Goblin.registerQuest(goblinName, 'deletePrefilter', function* (
  quest,
  prefilterId
) {
  quest.do();
  const prefilterAPI = yield quest.createEntity(prefilterId);
  yield prefilterAPI.hardDeleteEntity();
});

Goblin.registerQuest(goblinName, 'delete', function (quest) {
  // TODO: Kill prefilter instances
});

module.exports = Goblin.configure(goblinName, logicState, logicHandlers);
