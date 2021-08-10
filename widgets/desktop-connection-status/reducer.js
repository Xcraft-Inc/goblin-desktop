import Shredder from 'xcraft-core-shredder';

const initialState = new Shredder({dialogVisibility: false});

export default (state = initialState, action = {}) => {
  switch (action.type) {
    case 'SHOW_DIALOG': {
      return state.set('dialogVisibility', true);
    }
    case 'HIDE_DIALOG': {
      return state.set('dialogVisibility', false);
    }
  }
  return state;
};
