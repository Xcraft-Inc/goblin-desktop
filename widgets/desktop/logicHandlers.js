//T:2019-02-27
module.exports = {
  create: (state, action) => {
    const id = action.get('id');
    return state.set('', {
      id: id,
      username: action.get('username', 'guest'),
      routes: action.get('routes'),
      showNotifications: 'false',
      dnd: 'false',
      onlyNews: 'false',
      notReadCount: 0,
      notifications: {},
      teamId: null,
      current: {
        workitems: {},
      },
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
      externalUrl: action.get('externalUrl'),
    };
    return state.set(`notifications.${notificationId}`, notification);
  },
  'update-not-read-count': state => {
    const notifications = state.get('notifications').select((i, v) => v.toJS());
    const count = notifications.reduce((acc, n) => {
      if (n.status === 'not-read') {
        return acc + 1;
      }
      return acc;
    }, 0);
    return state.set('notReadCount', count);
  },
  'read-all': state => {
    const notifications = state.get('notifications');
    const newNotifications = notifications.transform(
      i => i,
      (i, v) => v.set('status', 'read')
    );
    return state.set('notifications', newNotifications);
  },
  'remove-notification': (state, action) => {
    const id = action.get('notification').id;
    return state.del(`notifications.${id}`);
  },
  'remove-notifications': state => {
    return state.set(`notifications`, {});
  },
  'nav-to-context': (state, action) => {
    return state.set('current.workcontext', action.get('contextId'));
  },
  'add-workitem': (state, action) => {
    return state.set(`workitems.${action.get('widgetId')}`, {
      tabId: action.get('tabId'),
    });
  },
  'remove-workitem': (state, action) => {
    return state.del(`workitems.${action.get('widgetId')}`);
  },
  'change-team': (state, action) => {
    return state.set('teamId', action.get('teamId'));
  },
  setCurrentWorkitemByContext: (state, action) => {
    const lastWorkcontext = state.get('current.workcontext');
    const lastWorkitem = state.get(`current.workitems.${lastWorkcontext}`);
    const lastView = state.get(`current.views.${lastWorkcontext}`);

    return state
      .set('current.workcontext', action.get('contextId'))
      .set(
        `current.workitems.${action.get('contextId')}`,
        action.get('workitemId')
      )
      .set(`current.views.${action.get('contextId')}`, action.get('view'))
      .set('last', {
        workcontext: lastWorkcontext,
        workitem: lastWorkitem,
        view: lastView,
      });
  },
};
