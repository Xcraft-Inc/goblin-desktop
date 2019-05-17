//T:2019-02-27
const logicHandlers = require('./logic-handlers.js');

export default (state, action = {}) => {
  if (logicHandlers[action.type]) {
    return logicHandlers[action.type](state, action);
  }
  return state;
};
