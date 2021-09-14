import {
  datetime as DateTimeConverters,
  month as MonthConverters,
} from 'xcraft-core-converters';
const StringBuilder = require('goblin-nabu/lib/string-builder.js');

//-----------------------------------------------------------------------------

function getType(keys) {
  for (const key of keys) {
    if (key !== '') {
      // Check only the first not empty key.
      if (DateTimeConverters.check(key)) {
        if (key.endsWith('T00:00:00.000Z')) {
          return 'date';
        }
        return 'datetime';
      } else {
        break;
      }
    }
  }
  return 'string';
}

function format(key, indexType, propInfos) {
  switch (indexType) {
    case 'datetime':
      return DateTimeConverters.getDisplayed(key);
    case 'date':
      return DateTimeConverters.getDisplayed(key, 'date');
    default: {
      let labelText = key;
      if (propInfos) {
        const {type, valuesInfo} = propInfos.pick('type', 'valuesInfo');
        if (type === 'enum' && valuesInfo) {
          const value = valuesInfo.get(key);
          if (value && value.get('text')) {
            labelText = value.get('text');
          }
        }
      }
      return labelText;
    }
  }
}

// Remove accents/diacritics.
// See https://stackoverflow.com/questions/990904/remove-accents-diacritics-in-a-string-in-javascript
function preprocessFilter(filter) {
  if (!filter) {
    return null;
  }
  return filter
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function match(text, filter) {
  if (!text || !filter) {
    return true;
  }

  text = preprocessFilter(text);
  return text.includes(filter);
}

function extractTab(text, type) {
  if (typeof text === 'string') {
    if (text.length === 0) {
      return {internal: '(vide)', displayed: '(vide)'};
    }

    switch (type) {
      case 'datetime':
      case 'date': {
        const y = DateTimeConverters.getYear(text);
        const m = DateTimeConverters.getMonth(text);
        const mm = MonthConverters.getDisplayed(m, 'short');
        const internal = `${m}.${y}`;
        const displayed = StringBuilder.combine(mm, ' ', y);
        return {internal, displayed};
      }
      default: {
        const letter = text[0];
        if (letter === ' ' || letter === '\t') {
          return {internal: '?', displayed: '?'};
        }
        return {internal: letter, displayed: letter};
      }
    }
  }

  // TODO: If Nabu?
  return {internal: '?', displayed: '?'};
}

function isRange(type) {
  return type === 'date' || type === 'number';
}

//-----------------------------------------------------------------------------

export default {getType, format, preprocessFilter, match, extractTab, isRange};
