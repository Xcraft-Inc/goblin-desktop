//T:2019-02-27
'use strict';

const T = require('goblin-nabu');
const {buildWizard} = require('goblin-desktop');

const config = {
  name: 'cryo',
  title: T('Time machine'),
  gadgets: {},
  steps: {
    initialize: {
      quest: function*(quest) {
        const ripleyId = `ripley@${quest.goblin.id}`;
        quest.do({
          form: {ripleyId},
        });
        yield quest.create('ripley', {
          desktopId: quest.getDesktop(),
          id: ripleyId,
        });
        yield quest.me.next();
      },
    },
    configure: {
      buttons: function(quest, buttons) {
        return buttons.set('main', {
          glyph: 'brands/stack-overflow',
          text: T('Travel'),
          grow: '2',
          disabled: false,
        });
      },
      quest: function*(quest) {},
    },
    finish: {
      form: {},
      quest: function*(quest, form) {
        yield quest.me.next();
      },
    },
  },
};

module.exports = buildWizard(config);
