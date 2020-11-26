//T:2019-02-27
module.exports = {
  'create': (state, action) => {
    const id = action.get('id');
    return state.set('', {
      id: id,
      username: action.get('username', 'guest'),
      profileKey: action.get('profileKey'),
      routes: action.get('routes'),
      showNotifications: false,
      dnd: false,
      onlyNews: false,
      notReadCount: 0,
      notifications: {},
      showStateMonitor: false,
      stateMonitorHistory: {
        current: '',
        stack: [],
        index: -1,
      },
      teamId: null,
      current: {
        workitems: {},
        dialogs: {},
      },
      workitems: {},
      workitemsByContext: {},
      last: {},
      navigating: false,
      working: false,
    });
  },

  'start-nav': (state) => {
    return state.set('navigating', true);
  },

  'end-nav': (state) => {
    return state.set('navigating', false);
  },

  //---------------//
  // Notifications //
  //---------------//
  'set-dnd': (state, action) => {
    return state.set('dnd', action.get('show'));
  },
  'set-only-news': (state, action) => {
    return state.set('onlyNews', action.get('show'));
  },
  'set-notifications': (state, action) => {
    return state.set('showNotifications', action.get('show'));
  },
  'add-notification': (state, action) => {
    const notificationId = action.get('notificationId');
    let count = state.get('notifications').count();
    const notification = {
      id: notificationId,
      order: count++,
      command: action.get('command'),
      status: 'not-read',
      glyph: action.get('glyph'),
      color: action.get('color'),
      message: action.get('message'),
      current: action.get('current'),
      total: action.get('total'),
      externalUrl: action.get('externalUrl'),
      isDownload: action.get('isDownload'),
    };
    return state.set(`notifications.${notificationId}`, notification);
  },
  'update-not-read-count': (state) => {
    const notifications = state.get('notifications').select((i, v) => v.toJS());
    const count = notifications.reduce((acc, n) => {
      if (n.status === 'not-read') {
        return acc + 1;
      }
      return acc;
    }, 0);
    return state.set('notReadCount', count);
  },
  'read-all': (state) => {
    const notifications = state.get('notifications');
    const newNotifications = notifications.transform(
      (i) => i,
      (i, v) => v.set('status', 'read')
    );
    return state.set('notifications', newNotifications);
  },
  'remove-notification': (state, action) => {
    const id = action.get('notification').id;
    return state.del(`notifications.${id}`);
  },
  'remove-notifications': (state) => {
    return state.set(`notifications`, {});
  },

  //--------------//
  // StateMonitor //
  //--------------//
  'show-state-monitor': (state, action) => {
    const show = action.get('show');
    return state.set('showStateMonitor', show);
  },
  'add-state-monitor': (state, action) => {
    const key = action.get('key');
    const doPush = action.get('doPush');

    const h = state.get('stateMonitorHistory');
    const stack = h.get('stack').toArray();
    let index = h.get('index');

    if (doPush) {
      // Truncate keys after the current index in the history.
      stack.splice(index + 1);
      index = stack.length - 1;

      // If key already exist in the history, remove it.
      const i = stack.indexOf(key);
      if (i !== -1) {
        stack.splice(i, 1);
        index = stack.length - 1;
      }

      // Insert the new key to the end of the history.
      stack.push(key);
      index = stack.length - 1;
    }

    state = state.set('stateMonitorHistory', {current: key, stack, index});
    state = state.set('showStateMonitor', true);

    return state;
  },
  'back-state-monitor': (state) => {
    const index = state.get('stateMonitorHistory.index');
    return state.set('stateMonitorHistory.index', index - 1);
  },
  'forward-state-monitor': (state) => {
    const index = state.get('stateMonitorHistory.index');
    return state.set('stateMonitorHistory.index', index + 1);
  },

  /******************************************************************************/

  'navToContext': (state, action) => {
    return state.set('current.workcontext', action.get('contextId'));
  },
  'add-workitem': (state, action) => {
    return state.set('working', action.get('working'));
  },
  'setHinter': (state, action) => {
    const workcontext = state.get('current.workcontext');
    const wid = state.get(`current.workitems.${workcontext}`);
    return state.set(`workitems.${wid}.hinter`, action.get('hinterId'));
  },
  'setDetail': (state, action) => {
    const workcontext = state.get('current.workcontext');
    const wid = state.get(`current.workitems.${workcontext}`);
    return state.set(`workitems.${wid}.detail`, action.get('detailId'));
  },
  'set-workitem': (state, action) => {
    const wid = action.get('id');
    const workcontext = action.get('context');
    return state
      .set(`workitems.${wid}`, {
        id: wid,
        kind: action.get('kind'),
        entityId: action.get('entityId'),
        context: workcontext,
        view: action.get('view'),
        name: action.get('name'),
        glyph: action.get('glyph'),
        closable: action.get('closable'),
      })
      .push(`workitemsByContext.${workcontext}`, wid);
  },
  'removeWorkitem': (state, action) => {
    const wid = action.get('workitemId');
    const workcontext = state.get(`workitems.${wid}.context`);

    state = state.del(`workitems.${wid}`);
    state = state.unpush(`workitemsByContext.${workcontext}`, wid);

    const last = state.get(`last.${workcontext}.workitem`);
    if (last === wid) {
      const newLast = state.get(`workitemsByContext.${workcontext}`).last();
      if (newLast.state) {
        state = state.set(`last.${workcontext}.workitem`, newLast.state);
      } else {
        state = state.set(`last.${workcontext}.workitem`, null);
      }
    }

    const currentWorkitem = state.get(`current.workitems.${workcontext}`);
    if (currentWorkitem === wid) {
      const newLast = state.get(`workitemsByContext.${workcontext}`).last();
      if (newLast.state) {
        state = state.set(`current.workitems.${workcontext}`, newLast.state);
      } else {
        state = state.set(`current.workitems.${workcontext}`, null);
      }
    }

    return state;
  },
  'change-team': (state, action) => {
    return state.set('teamId', action.get('teamId'));
  },

  'setCurrentWorkitemByContext': (state, action) => {
    const lastWorkcontext = state.get('current.workcontext');
    const lastWorkitem = state.get(`current.workitems.${lastWorkcontext}`);
    const workcontext = action.get('contextId');
    return state
      .set('current.workcontext', workcontext)
      .set(`current.workitems.${workcontext}`, action.get('workitemId'))
      .set(`last.${workcontext}`, {
        workcontext: lastWorkcontext,
        workitem: lastWorkitem,
      });
  },

  'setCurrentDialogByContext': (state, action) => {
    const workcontext = action.get('contextId');
    return state.set(
      `current.dialogs.${workcontext}`,
      action.get('workitemId')
    );
  },
};
