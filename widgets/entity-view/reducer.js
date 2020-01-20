import {fromJS} from 'immutable';
const initialState = fromJS({
  selectedRowId: null,
});

const actions = {
  'select-row': (state, action) => {
    return state.set('selectedRowId', action.rowId);
  },
};

export default (state = initialState, action = {}) => {
  if (actions[action.type]) {
    return actions[action.type](state, action);
  }
  return state;
};
