'use strict';
//T:2019-02-27

const Goblin = require('xcraft-core-goblin');
const goblinName = 'taskbar';
const uuidV4 = require('uuid/v4');
const confConfig = require('xcraft-core-etc')().load('goblin-configurator');

// Define initial logic values
const logicState = {};
// Define logic handlers according rc.json
const logicHandlers = {
  create: (state, action) => {
    const id = action.get('id');
    return state.set('', {
      id: id,
      context: action.get('contextId'),
    });
  },
};

// Register quest's according rc.json

Goblin.registerQuest(goblinName, 'create', function (quest, desktopId) {
  quest.goblin.setX('desktopId', desktopId);
  quest.do();
  return quest.goblin.id;
});

Goblin.registerQuest(goblinName, 'change-mandate', function (quest) {
  quest.evt(`mandate.changed`);
});

Goblin.registerQuest(goblinName, 'delete', function (quest) {
  quest.log.info('deleting tasks...');
});

Goblin.registerQuest(goblinName, 'run-app', function* (quest, app) {
  if (!app.mainGoblin) {
    throw new Error('missing mainGoblin in app definition');
  }
  if (!app.rootWidget) {
    app.rootWidget = 'desktop';
  }

  const desktopId = quest.goblin.getX('desktopId');
  const desk = quest.getAPI(desktopId);
  const sameOriginConfig = yield desk.getConfiguration();
  const clientSessionId = yield desk.getClientSessionId();

  if (app.mandate) {
    //change mandate
    //TODO: security -> use app whitelist
    //it's possible to open an app to another mandate...
    //not secure in multi-tenant configuration
    sameOriginConfig.mandate = app.mandate;
  }

  const username = yield desk.getUserInfo();
  const newDesktopSessionId = `desktop@${app.mandate}@${username}`;
  quest.evt(`${clientSessionId}.open-session-requested`, {
    desktopId: newDesktopSessionId,
    session: newDesktopSessionId,
    username: username,
    rootWidget: app.rootWidget,
    configuration: sameOriginConfig,
    mainGoblin: app.mainGoblin,
  });
  return;
});

Goblin.registerQuest(goblinName, 'run-workitem', function* (
  quest,
  app,
  workitem,
  contextId
) {
  const desk = quest.getAPI(quest.goblin.getX('desktopId'));

  workitem.id = uuidV4();
  workitem.isDone = false;
  workitem.contextId = contextId;
  return yield desk.addWorkitem({workitem, navigate: true});
});

// Create a Goblin with initial state and handlers
module.exports = Goblin.configure(goblinName, logicState, logicHandlers);
