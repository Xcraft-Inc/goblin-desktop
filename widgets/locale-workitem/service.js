'use strict';
//T:2019-02-27

const {buildWorkitem} = require('goblin-workshop');

const config = {
  type: 'locale',
  kind: 'workitem',
  quests: {},
  hinters: {
    locale: {
      onValidate: function*(quest, selection) {
        const localeApi = quest.getAPI(quest.goblin.getX('entityId'));
        yield localeApi.setLocaleId({entityId: selection.value});
      },
    },
  },
  buttons: function(quest, buttons) {
    const index = buttons.findIndex(button => button.get('id') === 'reset');
    return index >= 0 ? buttons.delete(index) : buttons;
  },
};

module.exports = buildWorkitem(config);
