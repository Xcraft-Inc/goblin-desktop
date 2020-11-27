'use strict';

const path = require('path');
const goblinName = path.basename(module.parent.filename, '.js');

const T = require('goblin-nabu/widgets/helpers/t.js');
const Goblin = require('xcraft-core-goblin');
const busClient = require('xcraft-core-busclient').getGlobal();

// Define initial logic values
const logicState = {
  id: goblinName,
  serverTick: 0,
};

// Define logic handlers according rc.json
const logicHandlers = {
  tick: (state) => {
    return state.set('serverTick', Date.now());
  },
};

Goblin.registerQuest(goblinName, 'tick', function (quest) {
  quest.do();
});

Goblin.registerQuest(goblinName, '_createDesktop', function* (
  quest,
  sessionDesktopId,
  clientSessionId,
  labId,
  session,
  username,
  configuration,
  mainGoblin
) {
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

  if (configuration && configuration.defaultContextId) {
    yield desk.setNavToDefault({
      defaultContextId: configuration.defaultContextId,
    });
  }
});

Goblin.registerQuest(goblinName, 'open', function* (
  quest,
  clientSessionId,
  labId,
  sessionDesktopId,
  session,
  username,
  mainGoblin,
  configuration,
  next
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

  quest.log.dbg(`${username} opening desktop...`);

  /* CREATE A DESKTOP
   * It uses the global busClient with a dedicated orcName in order to
   * keep ARP entries for multicasting when the portal is going out.
   * If we use the orcName provided by portal, then the entries are
   * removed (linesIds too) when the socket is closed. It's necessary in
   * the case of the desktop because the desktop is the session and the
   * session can lives without portal.
   */
  const busClient = require('xcraft-core-busclient').getGlobal();
  const resp = busClient.newResponse('desktop-manager', 'token');
  yield resp.command.send(
    `desktop-manager._createDesktop`,
    {
      sessionDesktopId,
      clientSessionId,
      labId,
      session,
      username,
      configuration,
      mainGoblin,
    },
    next
  );

  quest.log.dbg(`${username} opening desktop...[DONE]`);
  return {desktopId: sessionDesktopId};
});

Goblin.registerQuest(goblinName, 'close', function* (quest, sessionDesktopId) {
  quest.evt(`${sessionDesktopId}.closed`); /* for laboratory cleaning */
  yield quest.warehouse.unsubscribe({feed: sessionDesktopId});
});

module.exports = Goblin.configure(goblinName, logicState, logicHandlers);

Goblin.createSingle(goblinName);
