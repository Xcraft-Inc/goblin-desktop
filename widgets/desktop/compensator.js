//T:2019-02-27
const handlers = require('./logic-handlers.js');
export default (state, action = {}) => {
  if (handlers[action.type]) {
    return handlers[action.type](state, action);
  } else {
    return state;
  }
};
