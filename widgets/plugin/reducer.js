import Shredder from 'xcraft-core-shredder';

const initialState = new Shredder({
  extendedId: null,
});

export default (state = initialState, action) => {
  switch (action.type) {
    case 'TOGGLE_EXTENDED': {
      const current = state.get('extendedId');
      if (current === action.entityId) {
        return state.set('extendedId', null);
      }
      return state.set('extendedId', action.entityId);
    }
  }
};
