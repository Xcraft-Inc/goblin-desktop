module.exports = {
  create: (state, action) => {
    const id = action.get('id');
    return state.set('', {
      id: id,
      name: action.get('name'),
      type: action.get('type'),
      kind: action.get('kind'),
      title: action.get('title'),
      glyph: action.get('glyph'),
      onNew: !!action.get('newWorkitem'),
      newButtonTitle: action.get('newButtonTitle'),
      rows: [],
      selectedIndex: null,
      withDetails: action.get('withDetails'),
      values: [],
    });
  },
  'set-selections': (state, action) => {
    return state
      .set('rows', action.get('rows'))
      .set('glyphs', action.get('glyphs'))
      .set('status', action.get('status'))
      .set('values', action.get('values'))
      .set('payloads', action.get('payloads'))
      .set('selectedIndex', '0');
  },
  'select-row': (state, action) => {
    const index = action.get('index') || 0;
    return state.set('selectedIndex', index);
  },
  'next-row': state => {
    const index = state.get('selectedIndex');
    if (index === state.get('rows').size - 1) {
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
  delete: state => {
    return state.set('', {});
  },
};
