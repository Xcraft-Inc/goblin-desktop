export default (state, action = {}) => {
  //Pre compensate loading
  if (action.type === 'set-loading') {
    return state.set('loading', true);
  }
  //Pre compensate loading
  if (action.type === 'set-entity') {
    if (state.get('entityId') !== action.data.entityId) {
      return state.set('loading', true);
    } else {
      return state.set('loading', false);
    }
  }
  return state;
};
