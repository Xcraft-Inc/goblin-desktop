//T:2019-02-27
module.exports = {
  'create': (state, action) => {
    const id = action.get('id');
    return state.set('', {
      id: id,
      username: action.get('username', 'guest'),
      routes: action.get('routes'),
      showNotifications: false,
      dnd: false,
      onlyNews: false,
      notReadCount: 0,
      notifications: {},
      teamId: null,
      current: {
        workitems: {},
      },
      workitemsByContext: {},
      last: {},
    });
  },
  'add-context': (state, action) => {
    return state.set('current.workcontext', action.get('contextId'));
  },
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
  'nav-to-context': (state, action) => {
    return state.set('current.workcontext', action.get('contextId'));
  },
  'add-workitem': (state, action) => {
    const wid = action.get('widgetId');
    const workcontext = state.get('current.workcontext');
    return state
      .set(`workitems.${wid}`, {
        tabId: action.get('tabId'),
      })
      .push(`workitemsByContext.${workcontext}`, wid);
  },
  'add-dialog': (state) => {
    const workcontext = state.get('current.workcontext');
    const lastWorkitem = state.get(`current.workitems.${workcontext}`);
    const lastView = state.get(`current.views.${workcontext}`);
    return state.set(`last.${workcontext}`, {
      workcontext: workcontext,
      workitem: lastWorkitem,
      view: lastView,
    });
  },
  'remove-workitem': (state, action) => {
    const wid = action.get('widgetId');
    const workcontext = state.get('current.workcontext');

    state = state.del(`workitems.${wid}`).del(`current.location.${wid}`);
    state = state.unpush(`workitemsByContext.${workcontext}`, wid);

    const last = state.get(`last.${workcontext}.workitem`);
    if (last === wid) {
      const newLast = state.get(`workitemsByContext.${workcontext}`).last();
      if (newLast.state) {
        state = state.set(`last.${workcontext}.workitem`, newLast.state);
        //TODO: handle last view
      } else {
        state = state.set(`last.${workcontext}.workitem`, null);
        state = state.set(`last.${workcontext}.view`, null);
      }
    }

    const currentWorkitem = state.get(`current.workitems.${workcontext}`);
    if (currentWorkitem === wid) {
      const newLast = state.get(`workitemsByContext.${workcontext}`).last();
      if (newLast.state) {
        state = state.set(`current.workitems.${workcontext}`, newLast.state);
        //TODO: handle current view
      } else {
        state = state.set(`current.workitems.${workcontext}`, null);
        state = state.set(`current.views.${workcontext}`, null);
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
    const lastView = state.get(`current.views.${lastWorkcontext}`);
    const workcontext = action.get('contextId');
    return state
      .set('current.workcontext', workcontext)
      .set(`current.workitems.${workcontext}`, action.get('workitemId'))
      .set(`current.views.${workcontext}`, action.get('view'))
      .set(`last.${workcontext}`, {
        workcontext: lastWorkcontext,
        workitem: lastWorkitem,
        view: lastView,
      });
  },

  'setCurrentLocationByContext': (state, action) => {
    const lastWorkcontext = state.get('current.workcontext');
    return state.set(`current.location.${lastWorkcontext}`, {
      path: action.get('path'),
      search: action.get('search'),
      hash: action.get('hash'),
    });
  },

  'setCurrentLocationByWorkitem': (state, action) => {
    const currentContext = state.get('current.workcontext');
    const currentWorkitem = state.get(`current.workitems.${currentContext}`);
    return state.set(`current.location.${currentWorkitem}`, {
      path: action.get('path'),
      search: action.get('search'),
      hash: action.get('hash'),
    });
  },
};
