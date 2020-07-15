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
        return 'datetime';
      } else {
        break;
      }
    }
  }
  return 'string';
}

function format(text, type) {
  if (type === 'datetime') {
    return DateTimeConverters.getDisplayed(text);
  }
  return text;
}

function extractTab(text, type) {
  if (typeof text === 'string') {
    if (text.length === 0) {
      return {internal: '(vide)', displayed: '(vide)'};
    }

    if (type === 'datetime') {
      const y = DateTimeConverters.getYear(text);
      const m = DateTimeConverters.getMonth(text);
      const mm = MonthConverters.getDisplayed(m, 'short');
      const internal = `${m}.${y}`;
      const displayed = StringBuilder.combine(mm, ' ', y);
      return {internal, displayed};
    } else {
      const letter = text[0];
      if (letter === ' ' || letter === '\t') {
        return {internal: '?', displayed: '?'};
      }
      return {internal: letter, displayed: letter};
    }
  }

  // TODO: If Nabu?
  return {internal: '?', displayed: '?'};
}

//-----------------------------------------------------------------------------

module.exports = {
  getType,
  format,
  extractTab,
};
