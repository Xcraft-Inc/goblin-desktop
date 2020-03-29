import {
  datetime as DateTimeConverters,
  month as MonthConverters,
} from 'xcraft-core-converters';
const StringBuilder = require('goblin-nabu/lib/string-builder.js');

//-----------------------------------------------------------------------------

function getType(keys) {
  for (const key of keys) {
    // Check only the first key.
    if (DateTimeConverters.check(key)) {
      return 'datetime';
    } else {
      break;
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
  if (text && typeof text === 'string' && text.length > 0) {
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
