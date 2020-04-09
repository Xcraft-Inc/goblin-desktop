module.exports = {
  'create': (state, action) => {
    const id = action.get('id');
    const desktopId = action.get('desktopId');
    return state.set('', {
      id: id,
      tabs: {},
      desktopId,
      current: {},
    });
  },
  'add': (state, action) => {
    const tabId = action.get('tabId');
    const contextId = action.get('contextId');
    const current = state.get(`current.${contextId}`, null);
    const tab = {
      id: tabId,
      view: action.get('view'),
      name: action.get('name'),
      workitemId: action.get('workitemId'),
      entityId: action.get('entityId'),
      closable: action.get('closable'),
      glyph: action.get('glyph'),
    };
    if (!current) {
      return state
        .set(`current.${contextId}`, action.get('workitemId'))
        .set(`tabs.${contextId}.${tabId}`, tab);
    }
    return state.set(`tabs.${contextId}.${tabId}`, tab);
  },
  'set-current': (state, action) => {
    const wid = action.get('workitemId');
    const contextId = action.get('contextId');
    return state.set(`current.${contextId}`, wid);
  },
  'remove': (state, action) => {
    const tabId = action.get('tabId');
    const contextId = action.get('contextId');
    return state.del(`tabs.${contextId}.${tabId}`);
  },
};
