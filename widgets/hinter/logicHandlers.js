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
  delete: state => {
    return state.set('', {});
  },
};
