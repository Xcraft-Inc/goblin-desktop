//This respect front-end logic of plugins,
//actually backend service do things a little differently
const logicHandlers = {
  clear: state => {
    return state.set('entityIds', []).set('extendedId', null);
  },
  remove: (state, action) => {
    const entityId = action.get('entityId');
    return state.unpush('entityIds', entityId);
  },
  select: (state, action) => {
    const entityIds = action.get('entityIds');
    const clear = action.get('clear');
    const mode = action.get('mode');

    let newState = state;
    if (clear) {
      newState = newState.clear('selectedIds');
    }

    const selectedIds = newState.get('selectedIds').toArray();
    for (const entityId of entityIds) {
      const indexOf = selectedIds.indexOf(entityId);
      switch (mode) {
        default:
        case 'set':
          if (indexOf === -1) {
            newState = newState.push('selectedIds', entityId);
          }
          break;
        case 'clear':
          if (indexOf !== -1) {
            newState = newState.unpush('selectedIds', entityId);
          }
          break;
        case 'swap':
          if (indexOf === -1) {
            newState = newState.push('selectedIds', entityId);
          } else {
            newState = newState.unpush('selectedIds', entityId);
          }
          break;
      }
    }

    return newState;
  },
  extend: (state, action) => {
    const entityId = action.get('entityId');
    const currentId = state.get('extendedId');
    const extendedIds = state.get('extendedIds').toArray();
    const indexOf = extendedIds.indexOf(entityId);

    if (indexOf !== -1) {
      state = state.unpush('extendedIds', entityId);
    } else {
      state = state.push('extendedIds', entityId);
    }

    if (entityId === currentId) {
      return state.set('extendedId', null); // compact panel
    } else {
      return state.set('extendedId', entityId); // extend panel
    }
  },
  'compact-all': state => {
    return state.set('extendedId', null); // compact all panels
  },
  drag: (state, action) => {
    const fromId = action.get('fromId');
    const toId = action.get('toId');
    return state.move('entityIds', fromId, toId);
  },
};

export default (state, action = {}) => {
  console.log(state.get('id'), action.type);
  if (logicHandlers[action.type]) {
    return logicHandlers[action.type](state, action);
  }
  return state;
};
