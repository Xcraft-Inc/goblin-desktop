//T:2019-02-28
'use strict';

const goblinName = 'nabu-toolbar';

const Goblin = require('xcraft-core-goblin');
const T = require('goblin-nabu/widgets/helpers/t.js');

// Define initial logic values
const logicState = {
  show: false,
  enabled: false,

  marker: false,
  focus: null,

  selectedLocaleId: null,
  selectionMode: {
    enabled: false,
    selectedItemId: null,
  },
};

// Define logic handlers according rc.json
const logicHandlers = {
  'create': (state, action) => {
    return state
      .set('id', action.get('id'))
      .set('show', action.get('show'))
      .set('selectedLocaleId', action.get('localeId'));
  },
  'enable': state => {
    return state.set('enabled', true);
  },
  'disable': state => {
    return state.set('enabled', false);
  },

  'toggle-enabled': state => {
    const newState = !state.get('enabled');
    return state.set('enabled', newState);
  },
  'toggle-marks': state => {
    const newState = !state.get('marker');
    return state.set('marker', newState);
  },

  'set-focus': (state, action) => {
    return state.set(
      'focus',
      action.get('value') ? action.get('messageId') : null
    );
  },

  'set-selected-locale': (state, action) => {
    return state.set(`selectedLocaleId`, action.get('localeId'));
  },

  'set-selected-item': (state, action) => {
    return state.set(`selectionMode.selectedItemId`, action.get('messageId'));
  },

  'toggle-selection-mode': state => {
    const newState = !state.get(`selectionMode.enabled`);
    return state.set(`selectionMode.enabled`, newState);
  },
};

Goblin.registerQuest(goblinName, 'get', function(quest) {
  return quest.goblin.getState();
});

Goblin.registerQuest(goblinName, 'getSelectedLocale', function*(quest) {
  const selectedLocaleId = quest.goblin.getState().get('selectedLocaleId');
  const nabuApi = quest.getAPI('nabu');
  const locales = yield nabuApi.getLocales();

  return locales.find(locale => locale.get('id') === selectedLocaleId);
});

Goblin.registerQuest(goblinName, 'create', function*(
  quest,
  desktopId,
  enabled
) {
  quest.goblin.setX('desktopId', desktopId);

  if (enabled) {
    yield quest.me.enable();
  }

  quest.do();
});

Goblin.registerQuest(goblinName, 'delete', function(quest) {});

Goblin.registerQuest(goblinName, 'open-locale-search', function*(quest, next) {
  const desk = quest.getAPI(quest.goblin.getX('desktopId'));
  const workitem = {
    name: 'locale-search',
    description: T("Recherche d'une locale"),
    view: 'default',
    icon: 'solid/search',
    kind: 'tab',
    isClosable: true,
    navigate: true,
    maxInstances: 1,
  };

  yield desk.addWorkitem({workitem, navigate: true}, next);
});

Goblin.registerQuest(goblinName, 'open-session', function*(quest) {
  const client = quest.getAPI('client');
  yield client.openSession({});
});

Goblin.registerQuest(goblinName, 'open-datagrid', function*(quest, next) {
  const desk = quest.getAPI(quest.goblin.getX('desktopId'));
  const workitem = {
    id: quest.uuidV4(),
    name: 'nabuMessage-datagrid',
    view: 'default',
    icon: 'solid/file-alt',
    kind: 'tab',
    isClosable: true,
    navigate: true,
    maxInstances: 1,
    isDone: false,
  };

  yield desk.addWorkitem({workitem, navigate: true}, next);
});

Goblin.registerQuest(goblinName, 'open-single-entity', function*(
  quest,
  entityId,
  next
) {
  const desktopId = quest.goblin.getX('desktopId');
  const desk = quest.getAPI(desktopId);

  if (entityId) {
    const workitem = {
      id: quest.uuidV4(),
      name: 'nabuMessage-workitem',
      view: 'default',
      icon: 'solid/file-alt',
      kind: 'dialog',
      isClosable: true,
      navigate: true,
      isDone: false,
      payload: {
        entityId,
      },
    };

    const workitemId = yield desk.addWorkitem({workitem, navigate: true}, next);
    const workitemApi = quest.getAPI(workitemId);
    yield workitemApi.setPostRemove({
      postRemoveAction: () =>
        quest.goblin.setX('singleEntityWorkitemId', undefined),
    });

    quest.goblin.setX('singleEntityWorkitemId', workitemId);

    const nabu = quest.getAPI('nabu');
    // TODO: optimize with delegator
    yield nabu.loadTranslations({
      messageId: entityId,
      desktopId,
    });
  }
});

Goblin.registerQuest(goblinName, 'set-selected-item', function*(
  quest,
  messageId,
  next
) {
  const enabled = quest.goblin.getState().get('enabled');
  if (enabled) {
    const workitemId = quest.goblin.getX('singleEntityWorkitemId');
    if (workitemId) {
      const workitemApi = quest.getAPI(workitemId);
      yield workitemApi.changeEntity(
        {
          entityId: messageId,
        },
        next
      );
    }
    quest.do();
  }
});

function simplifyName(localeName) {
  return localeName.toLowerCase().replace('-', '_');
}

function getLang(localeName) {
  return simplifyName(localeName).split('_')[0];
}

function findBestLocale(locales, localeName) {
  // Compare name exacly
  let locale = locales.find(l => l.get('name') === localeName);
  if (locale) {
    return locale;
  }
  // Compare name approximately (en_US matches en-us)
  locale = locales.find(
    l => simplifyName(l.get('name')) === simplifyName(localeName)
  );
  if (locale) {
    return locale;
  }
  // Compare lang exacly (en_US matches en but not en_GB)
  locale = locales.find(
    l => simplifyName(l.get('name')) === getLang(localeName)
  );
  if (locale) {
    return locale;
  }
  // Compare lang only (en_US matches en_GB)
  locale = locales.find(
    l => simplifyName(getLang(l.get('name'))) === getLang(localeName)
  );
  return locale;
}

Goblin.registerQuest(goblinName, 'set-locale-from-name', function*(
  quest,
  name
) {
  const nabuAPI = quest.getAPI('nabu');
  const nabuState = yield nabuAPI.get();
  const locales = nabuState.get('locales');
  const locale = findBestLocale(locales, name);
  if (!locale) {
    return false;
  }
  const localeId = locale.get('id');
  yield quest.me.setSelectedLocale({localeId});
  return true;
});

//Dynamic API see reducers for params
for (const action of Object.keys(logicHandlers)) {
  switch (action) {
    case 'enable':
    case 'disable':
    case 'toggle-enabled':
    case 'set-selected-locale':
      Goblin.registerQuest(goblinName, action, function(quest) {
        quest.do();
      });
      break;
    case 'toggle-selection-mode':
    case 'toggle-marks':
    case 'set-focus':
      Goblin.registerQuest(goblinName, action, function(quest) {
        const enabled = quest.goblin.getState().get('enabled');
        if (enabled) {
          quest.do();
        }
      });
  }
}

module.exports = Goblin.configure(goblinName, logicState, logicHandlers);
