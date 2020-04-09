import {fromJS} from 'immutable';
const initialState = fromJS({
  selectedIndex: 0,
  rowCount: 0,
});

const actions = {
  'init-hinter': (state, action) => {
    return state.set('rowCount', action.rowCount).set('selectedIndex', 0);
  },
  'select-row': (state, action) => {
    return state.set('selectedIndex', parseInt(action.index));
  },
  'next-row': (state) => {
    const index = parseInt(state.get('selectedIndex'));
    if (index === state.get('rowCount') - 1) {
      return state;
    }
    return state.set('selectedIndex', parseInt(index) + 1);
  },
  'prev-row': (state) => {
    const index = state.get('selectedIndex');
    if (index === 0) {
      return state;
    }
    return state.set('selectedIndex', parseInt(index) - 1);
  },
};

export default (state = initialState, action = {}) => {
  if (actions[action.type]) {
    return actions[action.type](state, action);
  }
  return state;
};
