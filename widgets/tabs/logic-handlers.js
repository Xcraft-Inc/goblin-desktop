module.exports = {
  create: (state, action) => {
    const id = action.get('id');
    const desktopId = action.get('desktopId');
    return state.set('', {
      id: id,
      tabs: {},
      desktopId,
    });
  },
  add: (state, action) => {
    const tabId = action.get('tabId');
    const contextId = action.get('contextId');
    const tab = {
      id: tabId,
      view: action.get('view'),
      name: action.get('name'),
      workitemId: action.get('workitemId'),
      entityId: action.get('entityId'),
      closable: action.get('closable'),
      glyph: action.get('glyph'),
    };
    return state.set(`tabs.${contextId}.${tabId}`, tab);
  },
  remove: (state, action) => {
    const tabId = action.get('tabId');
    const contextId = action.get('contextId');
    return state.del(`tabs.${contextId}.${tabId}`);
  },
};
