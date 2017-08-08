'use strict';

const path = require ('path');
const Goblin = require ('xcraft-core-goblin');
const uuidV4 = require ('uuid/v4');
const goblinName = path.basename (module.parent.filename, '.js');

// Default route/view mapping
// /mountpoint/:context/:view/:hinter
const defaultRoutes = {
  tabs: '/before-content/:context',
  workitem: '/content/:context/:view',
  hinter: '/hinter/:context/:view/:hinter',
  taskbar: '/task-bar/:context',
  contexts: '/top-bar/',
};

// Define initial logic values
const logicState = {};

let nextNotificationOrder = 0;

// Define logic handlers according rc.json
const logicHandlers = {
  create: (state, action) => {
    const id = action.get ('id');
    return state.set ('', {
      id: id,
      routes: action.get ('routes'),
      showNotifications: 'false',
      dnd: 'false',
      onlyNews: 'false',
      notReadCount: 0,
      notifications: {},
      current: {
        workitems: {},
      },
    });
  },
  'toggle-dnd': state => {
    return state.set ('dnd', state.get ('dnd') === 'false' ? 'true' : 'false');
  },
  'toggle-only-news': state => {
    return state.set (
      'onlyNews',
      state.get ('onlyNews') === 'false' ? 'true' : 'false'
    );
  },
  'toggle-notifications': (state, action) => {
    return state.set ('showNotifications', action.get ('showValue'));
  },
  'add-notification': (state, action) => {
    const notificationId = action.get ('notificationId');
    const notification = {
      id: notificationId,
      order: nextNotificationOrder++,
      command: action.get ('command'),
      status: 'not-read',
      glyph: action.get ('glyph'),
      color: action.get ('color'),
      message: action.get ('message'),
    };
    return state.set (`notifications.${notificationId}`, notification);
  },
  'update-not-read-count': state => {
    const notifications = state
      .get ('notifications')
      .select ((i, v) => v.toJS ());
    const count = notifications.reduce ((acc, n) => {
      if (n.status === 'not-read') {
        return acc + 1;
      }
      return acc;
    }, 0);
    return state.set ('notReadCount', count);
  },
  'read-all': state => {
    const notifications = state.get ('notifications');
    const newNotifications = notifications.transform (
      i => i,
      (i, v) => v.set ('status', 'read')
    );
    return state.set ('notifications', newNotifications);
  },
  'remove-notification': (state, action) => {
    const id = action.get ('notification').id;
    return state.del (`notifications.${id}`);
  },
  'remove-notifications': state => {
    return state.set (`notifications`, {});
  },
  setCurrentWorkItemByContext: (state, action) => {
    return state
      .set (
        `current.workitems.${action.get ('contextId')}`,
        action.get ('workitemId')
      )
      .set (`current.views.${action.get ('contextId')}`, action.get ('view'));
  },
};

// Register quest's according rc.json
Goblin.registerQuest (goblinName, 'create', function* (
  quest,
  labId,
  onChangeMandate
) {
  if (!labId) {
    throw new Error ('Missing labId');
  }

  quest.goblin.setX ('labId', labId);
  if (onChangeMandate) {
    quest.goblin.setX ('onChangeMandate', onChangeMandate);
  }

  // CREATE DEFAULT CONTEXT MANAGER
  quest.create ('contexts', {
    id: `contexts@${quest.goblin.id}`,
    desktopId: quest.goblin.id,
  });

  // CREATE DEFAULT TABS MANAGER
  quest.create ('tabs', {
    id: `tabs@${quest.goblin.id}`,
    desktopId: quest.goblin.id,
  });

  quest.do ({id: quest.goblin.id, routes: defaultRoutes});

  quest.log.info (`Desktop ${quest.goblin.id} created!`);
  return quest.goblin.id;
});

Goblin.registerQuest (goblinName, 'create-hinter-for', function* (
  quest,
  workitemId,
  detailWidget,
  type,
  title,
  glyph,
  kind
) {
  const widgetId = workitemId ? `${type}-hinter@${workitemId}` : null;

  if (!type) {
    throw new Error ('Hinter type required');
  }

  if (!kind) {
    kind = 'list';
  }

  if (!title) {
    title = type;
  }

  let goblinName = Goblin.getGoblinName (workitemId);

  const hinter = yield quest.createFor (
    goblinName,
    workitemId,
    `hinter@${widgetId}`,
    {
      id: widgetId,
      type,
      desktopId: quest.goblin.id,
      title,
      glyph,
      kind,
      detailWidget,
    }
  );

  return hinter.id;
});

Goblin.registerQuest (goblinName, 'add-workitem', function* (quest, workitem) {
  const desk = quest.me;
  if (!workitem.id) {
    throw new Error (
      `Cannot add workitem without an id: ${JSON.stringify (workitem)}`
    );
  }
  if (!workitem.name) {
    throw new Error (
      `Cannot add workitem without a name: ${JSON.stringify (workitem)}`
    );
  }
  if (workitem.isDone) {
    return;
  }
  const widgetId = `${workitem.name}@${workitem.id}`;
  const wi = yield quest.create (
    widgetId,
    Object.assign (
      {
        id: widgetId,
        desktopId: quest.goblin.id,
        workflowId: workitem.workflowId,
      },
      workitem.payload
    )
  );

  if (workitem.isInWorkspace) {
    // Add a tab
    desk.addTab ({
      workitemId: widgetId,
      view: workitem.view,
      contextId: workitem.contextId,
      name: workitem.description,
      glyph: workitem.icon,
      closable: workitem.isClosable,
      navigate: true,
    });
  }

  quest.evt (`workitem.added`, {
    desktopId: quest.goblin.id,
    workitemId: wi.id,
  });

  return wi.id;
});

Goblin.registerQuest (goblinName, 'add-context', function (
  quest,
  contextId,
  name
) {
  const contexts = quest.use ('contexts');
  contexts.add ({
    contextId,
    name,
  });
});

Goblin.registerQuest (goblinName, 'add-tab', function* (
  quest,
  name,
  contextId,
  view,
  workitemId,
  closable,
  glyph,
  navigate
) {
  const state = quest.goblin.getState ();
  const workitem = state.get (`current.workitems.${contextId}`, null);
  if (!workitem) {
    quest.dispatch ('setCurrentWorkItemByContext', {
      contextId,
      view,
      workitemId,
    });
  }
  const tabs = quest.use ('tabs');
  tabs.add ({
    name,
    contextId,
    view,
    workitemId,
    glyph,
    closable: closable || false,
  });

  if (navigate) {
    quest.cmd ('desktop.nav-to-workitem', {
      id: quest.goblin.id,
      contextId,
      view,
      workitemId,
    });
  }
});

Goblin.registerQuest (goblinName, 'nav-to-context', function (
  quest,
  contextId
) {
  const labId = quest.goblin.getX ('labId');
  const lab = quest.useAs ('laboratory', labId);
  const state = quest.goblin.getState ();
  const view = state.get (`current.views.${contextId}`, null);

  if (view) {
    const workItem = state.get (`current.workitems.${contextId}`, null);
    if (workItem) {
      lab.nav ({route: `/${contextId}/${view}?wid=${workItem}`});
    } else {
      lab.nav ({route: `/${contextId}/${view}`});
    }
  } else {
    lab.nav ({route: `/${contextId}`});
  }
});

Goblin.registerQuest (goblinName, 'nav-to-workitem', function* (
  quest,
  contextId,
  view,
  workitemId,
  skipNav
) {
  const labId = quest.goblin.getX ('labId');
  const lab = quest.useAs ('laboratory', labId);
  quest.dispatch ('setCurrentWorkItemByContext', {contextId, view, workitemId});
  const tabs = quest.use ('tabs');
  tabs.setCurrent ({contextId, workitemId});
  if (skipNav) {
    return;
  }
  yield lab.nav ({route: `/${contextId}/${view}?wid=${workitemId}`});
});

Goblin.registerQuest (goblinName, 'clear-workitem', function* (
  quest,
  contextId
) {
  const labId = quest.goblin.getX ('labId');
  const lab = quest.useAs ('laboratory', labId);
  quest.dispatch ('setCurrentWorkItemByContext', {
    contextId,
    view: null,
    workitemId: null,
  });
  yield lab.nav ({route: `/${contextId}/?wid=null`});
});

Goblin.registerQuest (goblinName, 'dispatch', function (quest, action) {
  const labId = quest.goblin.getX ('labId');
  const lab = quest.useAs ('laboratory', labId);
  lab.dispatch ({action});
});

Goblin.registerQuest (goblinName, 'add-notification', function (
  quest,
  notificationId,
  glyph,
  color,
  message,
  command
) {
  if (!notificationId) {
    notificationId = uuidV4 ();
  }
  quest.do ({notificationId, glyph, color, message, command});
  const dnd = quest.goblin.getState ().get ('dnd');
  if (dnd !== 'true') {
    quest.dispatch ('toggle-notifications', {showValue: 'true'});
  }
  quest.dispatch ('update-not-read-count');
  return quest.goblin
    .getState ()
    .get (`notifications.${notificationId}`, null)
    .toJS ();
});

Goblin.registerQuest (goblinName, 'remove-notification', function (
  quest,
  notification
) {
  quest.do ({notification});
  quest.dispatch ('update-not-read-count');
});

Goblin.registerQuest (goblinName, 'remove-notifications', function (quest) {
  quest.do ();
  quest.dispatch ('update-not-read-count');
});

Goblin.registerQuest (goblinName, 'click-notification', function (
  quest,
  notification
) {
  if (notification.command) {
    quest.cmd (notification.command, {notification});
  }
});

Goblin.registerQuest (goblinName, 'toggle-dnd', function (quest) {
  quest.do ();
});

Goblin.registerQuest (goblinName, 'toggle-only-news', function (quest) {
  quest.do ();
});

Goblin.registerQuest (goblinName, 'toggle-notifications', function (quest) {
  const state = quest.goblin.getState ();
  const showValue = state.get ('showNotifications') === 'false'
    ? 'true'
    : 'false';
  quest.do ({showValue});
  if (showValue === 'false') {
    quest.dispatch ('read-all');
  }
  quest.dispatch ('update-not-read-count');
});

Goblin.registerQuest (goblinName, 'change-mandate', function (quest) {
  const onChangeMandate = quest.goblin.getX ('onChangeMandate');
  if (onChangeMandate) {
    quest.cmd (onChangeMandate.quest, {id: onChangeMandate.id});
  }
});

Goblin.registerQuest (goblinName, 'delete', function (quest) {
  quest.log.info ('Deleting desktop...');
});

// Create a Goblin with initial state and handlers
module.exports = Goblin.configure (goblinName, logicState, logicHandlers);
