'use strict';

try {
  require('goblin-workshop');

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
} catch (ex) {
  if (ex.code !== 'MODULE_NOT_FOUND') {
    throw ex;
  }
  console.log(
    `Skip ${__filename} initialization, goblin-workshop not available`
  );
}
