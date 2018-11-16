module.exports = {
  getColumnProps: c => {
    const props = {grow: '1', wrap: 'no-end'};
    if (typeof c === 'object') {
      const w = c.get('width', null);
      if (w) {
        delete props.grow;
        props.width = w;
      }
      const ta = c.get('textAlign', null);
      if (ta) {
        props.textAlign = ta;
      }
    }
    return props;
  },
  getColumnText: c => {
    if (typeof c === 'object') {
      if (!c.has('text')) {
        throw new Error('invalid column format');
      }
      return c.get('text');
    }
    return c;
  },
  getColumnPath: c => {
    if (typeof c === 'object') {
      if (!c.has('path')) {
        throw new Error('invalid column format');
      }
      return c.get('path');
    }
    return c;
  },
};
