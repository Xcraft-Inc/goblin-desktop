//T:2019-02-27

import Shredder from 'xcraft-core-shredder';

const initialState = new Shredder({
  enabled: false,
});

export default (state = initialState, action) => {
  switch (action.type) {
    case 'TOGGLE': {
      return state.set('enabled', !state.get('enabled'));
    }
  }
};
