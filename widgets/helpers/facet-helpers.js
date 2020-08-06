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

function format(text, type) {
  switch (type) {
    case 'datetime':
      return DateTimeConverters.getDisplayed(text);
    case 'date':
      return DateTimeConverters.getDisplayed(text, 'date');
    default:
      return text;
  }
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

module.exports = {
  getType,
  format,
  extractTab,
  isRange,
};
