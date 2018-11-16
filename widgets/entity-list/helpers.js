const targetFilter = /(.*)\[/;
const pathFilter = /(.*\])/;
const subPathFilter = /\]\.(.*)/;
const extract = extractor => (path, fallbackValue) => {
  const matches = path.match(extractor);
  if (matches) {
    return matches[1] ? matches[1] : fallbackValue;
  }
  return fallbackValue;
};
const extractTarget = extract(targetFilter);
const extractPath = extract(pathFilter);
const extractSubPath = extract(subPathFilter);

const columnGetter = key => c => {
  if (typeof c === 'object') {
    if (!c.has(key)) {
      throw new Error('invalid column format');
    }
    return c.get(key);
  }
  return c;
};

module.exports = {
  getColumnProps: c => {
    const props = {grow: '1', wrap: 'no'};
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
  getColumnText: columnGetter('text'),
  getColumnPath: c =>
    extractPath(columnGetter('path')(c), columnGetter('path')(c)),
  getColumnTargetPath: c =>
    extractTarget(columnGetter('path')(c), columnGetter('path')(c)),
  getColumnSubPath: c => extractSubPath(columnGetter('path')(c), null),
  skipRowIfEmpty: c => {
    if (typeof c === 'object') {
      if (!c.has('skipRowIfEmpty')) {
        return false;
      }
      return c.get('skipRowIfEmpty', true);
    }
    return false;
  },
};
