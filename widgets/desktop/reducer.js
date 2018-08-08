import {fromJS} from 'immutable';
const initialState = fromJS({
  showPrompt: false,
});

export default (state = initialState, action = {}) => {
  switch (action.type) {
    case 'TOGGLEPROMPT': {
      return state.set('showPrompt', !state.get('showPrompt'));
    }
  }
  return state;
};
