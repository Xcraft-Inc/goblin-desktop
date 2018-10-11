import {fromJS} from 'immutable';
const initialState = fromJS({
  selectedIndex: 0,
  rowCount: 10,
});

const actions = {
  initHinter: (state, action) => {
    return state.set('rowCount', action.get('rowCount'));
  },
  'select-row': (state, action) => {
    const index = action.get('index') || 0;
    return state.set('selectedIndex', index);
  },
  'next-row': state => {
    const index = state.get('selectedIndex');
    if (index === state.get('rowCount')) {
      return state;
    }
    return state.set('selectedIndex', parseInt(index) + 1);
  },
  'prev-row': state => {
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
