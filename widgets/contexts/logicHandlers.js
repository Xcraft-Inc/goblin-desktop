module.exports = {
  create: (state, action) => {
    const id = action.get('id');
    const desktopId = action.get('desktopId');
    return state.set('', {
      id: id,
      contexts: {},
      desktopId,
      current: null,
    });
  },
  add: (state, action) => {
    const name = action.get('name');
    const contextId = action.get('contextId');
    const current = state.get('current');
    if (!current) {
      return state
        .set('current', contextId)
        .set(`contexts.${contextId}`, {contextId, name});
    }
    return state.set(`contexts.${contextId}`, {contextId, name});
  },
  remove: (state, action) => {
    const widgetId = action.get('widgetId');
    return state.del(`contexts.${widgetId}`);
  },
  'set-current': (state, action) => {
    const contextId = action.get('contextId');
    return state.set('current', contextId);
  },
  delete: state => {
    return state.set('', {});
  },
};