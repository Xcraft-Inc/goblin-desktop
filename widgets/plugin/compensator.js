import pluginLogicHandlers from 'goblin-workshop/lib/workitems/plugin-logic-handlers.js';

const logicHandlers = {
  ...pluginLogicHandlers,
  /* drag reducer is specific to the front end compensator */
  drag: (state, action) => {
    const fromId = action.get('fromId');
    const toId = action.get('toId');
    return state.move('entityIds', fromId, toId);
  },
};

export default (state, action = {}) => {
  if (logicHandlers[action.type]) {
    return logicHandlers[action.type](state, action);
  }
  return state;
};
