'use strict';

const path = require('path');
const goblinName = path.basename(module.parent.filename, '.js');

const T = require('goblin-nabu/widgets/helpers/t.js');
const Goblin = require('xcraft-core-goblin');

// Define initial logic values
const logicState = {
  id: goblinName,
  userCount: 0,
};

// Define logic handlers according rc.json
const logicHandlers = {
  open: (state) => {
    return state.set('userCount', state.get('userCount') + 1);
  },
  close: (state) => {
    return state.set('userCount', state.get('userCount') - 1);
  },
};

Goblin.registerQuest(goblinName, '_init', function (quest) {
  quest.goblin.defer(
    quest.sub(`*::${goblinName}.session.closed`, function* (err, {msg, resp}) {
      yield resp.cmd(`${goblinName}.close`, {
        sessionDesktopId: msg.data.desktopId,
      });
    })
  );
});

Goblin.registerQuest(goblinName, 'open', function* (
  quest,
  clientSessionId,
  labId,
  desktopId,
  session,
  username,
  mainGoblin,
  configuration
) {
  // CREATE A DESKTOP
  quest.log.dbg(`${username} opening desktop...`);
  const desk = yield quest.createFor('desktop', desktopId, desktopId, {
    id: desktopId,
    desktopId,
    clientSessionId,
    labId,
    session,
    username,
    configuration,
    mainGoblin,
  });

  const exSession = quest.goblin.getX(`${desktopId}.session`);
  if (!exSession) {
    const mainGoblinAPI = quest.getAPI(mainGoblin);
    if (mainGoblinAPI.configureNewDesktopSession) {
      yield mainGoblinAPI.configureNewDesktopSession({desktopId});
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
  return {desktopId};
});

Goblin.registerQuest(goblinName, 'close', function* (quest, sessionDesktopId) {
  quest.do();
  quest.evt(`${sessionDesktopId}.closed`);
  yield quest.warehouse.killFeed({feed: sessionDesktopId});
});

function* _postload(msg, resp, next) {
  try {
    yield resp.command.nestedSend('desktop-manager._init', null, next);
    resp.events.send(`${goblinName}._postload.${msg.id}.finished`);
  } catch (ex) {
    resp.events.send(`${goblinName}._postload.${msg.id}.error`, {
      code: ex.code,
      message: ex.message,
      stack: ex.stack,
    });
  }
}

module.exports = Goblin.configure(goblinName, logicState, logicHandlers);
module.exports.handlers._postload = _postload;
Goblin.createSingle(goblinName);
