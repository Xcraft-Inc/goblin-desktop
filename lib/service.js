'use strict';

const path = require('path');
const goblinName = path.basename(module.parent.filename, '.js');

const T = require('goblin-nabu/widgets/helpers/t.js');
const Goblin = require('xcraft-core-goblin');
const busClient = require('xcraft-core-busclient').getGlobal();

// Define initial logic values
const logicState = {
  id: goblinName,
  userCount: 0,
  serverTick: 0,
};

// Define logic handlers according rc.json
const logicHandlers = {
  open: (state) => {
    return state.set('userCount', state.get('userCount') + 1);
  },
  close: (state) => {
    return state.set('userCount', state.get('userCount') - 1);
  },
  tick: (state) => {
    return state.set('serverTick', Date.now());
  },
};

Goblin.registerQuest(goblinName, 'tick', function (quest) {
  quest.do();
});

Goblin.registerQuest(goblinName, 'open', function* (
  quest,
  clientSessionId,
  labId,
  sessionDesktopId,
  session,
  username,
  mainGoblin,
  configuration
) {
  let serverTick = quest.goblin.getState().get('serverTick');
  if (serverTick === 0) {
    quest.dispatch('tick');
    const serverTickInterval = setInterval(
      () => busClient.command.send('desktop-manager.tick'),
      60000
    );
    quest.goblin.defer(() => clearInterval(serverTickInterval));
  }

  // CREATE A DESKTOP
  quest.log.dbg(`${username} opening desktop...`);
  const desk = yield quest.createFor(
    'desktop',
    sessionDesktopId,
    sessionDesktopId,
    {
      id: sessionDesktopId,
      desktopId: sessionDesktopId,
      clientSessionId,
      labId,
      session,
      username,
      configuration,
      mainGoblin,
    }
  );

  const exSession = quest.goblin.getX(`${sessionDesktopId}.session`);
  if (!exSession) {
    const mainGoblinAPI = quest.getAPI(mainGoblin);
    if (mainGoblinAPI.configureNewDesktopSession) {
      yield mainGoblinAPI.configureNewDesktopSession({
        desktopId: sessionDesktopId,
      });
    }
  } else {
    yield desk.setLabId({labId});
    yield desk.addNotification({
      notificationId: `userconnected`,
      color: 'green',
      glyph: 'solid/eye',
      message: T('{user} entre dans la session', '', {user: username}),
    });
  }

  quest.do();

  if (configuration && configuration.defaultContextId) {
    yield desk.setNavToDefault({
      defaultContextId: configuration.defaultContextId,
    });
  }
  quest.log.dbg(`${username} opening desktop...[DONE]`);
  return {desktopId: sessionDesktopId};
});

Goblin.registerQuest(goblinName, 'close', function* (quest, sessionDesktopId) {
  quest.do();
  quest.evt(`${sessionDesktopId}.closed`); /* for laboratory cleaning */
  yield quest.warehouse.unsubscribe({feed: sessionDesktopId});
});

module.exports = Goblin.configure(goblinName, logicState, logicHandlers);

Goblin.createSingle(goblinName);
