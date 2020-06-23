'use strict';

/**
 * Retrieve the list of available commands.
 *
 * @returns {Object} The list and definitions of commands.
 */
exports.xcraftCommands = function () {
  return require(`./widgets/${require('path').basename(
    __filename,
    '.js'
  )}/service.js`);
};
